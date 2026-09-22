# Uni build system

Uni is uwuAOSP's local build scheduler. It still uses Soong, Kati and Ninja to generate and execute Android build rules, while preserving build-graph state, splitting critical phases and assigning independent admission pools to high-memory work.

```sh
source build/envsetup.sh
lunch uwu_nabu-cp2a-userdebug
uni -j18 otapackage
```

The same entry point handles incremental module builds:

```sh
uni -j18 SystemUI Settings Launcher3QuickStep
```

## How it works

A full build is handled as preparation, startup and final Ninja phases:

1. **Preparation** checks the product, release, variant, targets, environment and build-system fingerprints. An unchanged fingerprint reuses the saved Soong/Blueprint graph; a changed one regenerates the Android.bp graph.
2. **Task selection** reads buildable targets from the product Ninja graph, then combines historical duration, R8 targets and kernel targets to calculate the startup order. Long tasks start earlier and R8 work is spread across batches instead of forming a tail.
3. **Startup** handles the required kernel or historical long tasks first. Kernel linking is kept apart from Kotlin, Java and R8 high-memory work to reduce simultaneous paging.
4. **Main execution** leaves the remaining targets to Ninja. The global `-j` remains the user's setting; Java, Kotlin, Rust, R8 and other high-memory tasks use separate admission pools through their environment variables.
5. **Finalization** validates that the graph did not change during the build before running packaging, distribution and OTA targets. Each completed phase writes state so the next run can reuse completed outputs.
6. **Recovery** preserves state and outputs after interruption or sustained memory pressure. A recovery run reads the disk state instead of deleting reusable artifacts; automatic pools are reduced only after pressure is observed.

Uni does not replace dependency validation or hide real source changes. It removes repeated preparation and avoidable waiting around the same dependency graph.

## What Uni adds over Make

Native `make`/`m` gives the whole Ninja graph one global concurrency limit. Uni adds:

- **Build-graph reuse** for the product, version, variant, targets, graph files and build-system source fingerprint.
- **Critical-path ordering** based on historical task duration, with R8 targets distributed across phases.
- **Kernel phase isolation** so kernel linking does not compete with R8 and Kotlin at the same time.
- **Independent resource pools** for R8, Java, Kotlin, Rust and other high-memory tasks without changing the global Ninja `-j`.
- **Rust admission control** that accounts for both `rustc` processes and LLVM codegen units.
- **Segment recovery** that keeps completed outputs after interruption or pressure.
- **Cache and telemetry reporting** for ccache, disk space, memory, swap, PSI, CPU, process peaks and pool decisions.
- **A compact terminal UI** for Graph, Kernel, Startup, Main, R8 and memory state, with details, copy mode and complete interruption.

## Resource formulas

Uni reads `MemTotal` and `MemAvailable` from `/proc/meminfo`. The following values are in GiB:

```text
T = MemTotal
A = MemAvailable
R = max(4, 0.25 × T)
H = min(6, max(4, 0.20 × T))
```

`R` is reserved for Soong's non-Go allocations, the operating system and file cache. `H` is the active-process headroom used while choosing the Android.bp analysis heap limit `G`:

```text
L = T - R
if A > H: G = min(L, max(A / 2, A - H))
if A ≤ H: G = A / 2
if the result ≤ 0: G = max(1, T / 2)
```

`G` is not a hard RSS limit for one `soong_build` process. C/C++, file mappings and toolchain processes also use memory, so non-Go headroom must remain available.

### Task pools

For a task pool, `B` is its admission budget and `J` is the user's global Ninja limit:

```text
P = max(1, min(J, floor((A - 3 GiB) / B)))
```

| Task | `B` |
| --- | ---: |
| Java | 2 GiB |
| Rust | 2 GiB |
| Other high-memory work | 4 GiB |
| R8 | 5 GiB |
| Kotlin | 5 GiB |

Rust also accounts for LLVM codegen units. When `C` is the codegen-unit count, the Rust pool does not exceed:

```text
min(PRust, ceil(J / C))
```

The explicit `NINJA_HIGHMEM_NUM_JOBS`, `NINJA_UNI_R8_NUM_JOBS`, `NINJA_UNI_RUST_NUM_JOBS`, `NINJA_UNI_JAVA_NUM_JOBS` and `NINJA_UNI_KOTLIN_NUM_JOBS` variables override their respective automatic pools. Without overrides, each phase reads `MemAvailable` again instead of using one hard-coded pool for every computer.

## Graph reuse and recovery

Normal reuse requires the following to remain compatible:

- product, release, variant and target arguments
- Android.bp, Blueprint, Make, Soong, Blueprint and product fingerprints
- the generated Ninja graph and its input freshness
- builder version and relevant environment variables

When source or build rules change, Uni prepares the affected graph again. Use recovery flags only after confirming that the disk outputs match the current source:

| Flag | Behavior |
| --- | --- |
| `--trust-output` | skips freshness validation for recovered outputs |
| `--assume-existing` | accepts outputs present on disk when Ninja logs are missing and enables `--trust-output` |
| `--force-reuse` | skips source freshness checks and forces the saved graph |

These flags do not change dependency relationships. After changing a product, branch or build rule, use a normal incremental build so Uni can refresh the graph.

## Common commands

```sh
# Show scheduling without running Ninja
uni --plan -j18 otapackage

# Rebuild the full R8 index for this run
uni --dev -j18 otapackage

# Persist automatic R8 index refresh
uni --dev-auto -j18 otapackage

# Remove Uni/Soong logs without deleting build outputs
uni --clean-logs

# Disable the detailed debug report for this run
uni --no-debug -j18 SystemUI
```

## Uni runtime telemetry

<UniBuildCharts locale="en" />

The chart plots CPU, `MemAvailable`, cumulative `swap-out` and `iowait` from telemetry fields. The horizontal axis is elapsed time within the final build phase.

## Output and troubleshooting

At completion, Uni prints one summary containing phase count, minimum available memory, swap-out, the package or output directory and total duration. Logs are written under `OUT_DIR`:

```text
uwuCli-output_<timestamp>.log
uwuCli-debug-report_<timestamp>.log
```

On failure, read the first real compiler error in the log. A final `FAILED: ninja` or `signal: killed` line only describes the final state and does not identify the root cause by itself.
