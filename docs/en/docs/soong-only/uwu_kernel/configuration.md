# uwu_kernel configuration reference

## Top-level properties

| Property | Description |
| --- | --- |
| `kernel_dir` | Kernel source directory relative to the Android source root; required for source builds |
| `prebuilt` | Prebuilt kernel path; skips source Kbuild when set |
| `prebuilt_config` | Generated `.config` file; only used with `prebuilt` |
| `prebuilt_headers` | Gzip-compressed kernel UAPI headers archive; only used with `prebuilt` |
| `prebuilt_modules` | Pre-generated kernel modules zip; only used with `prebuilt` |
| `kernel_arch` | Kbuild architecture, such as `arm64` |
| `image_name` | Kernel filename under `arch/<arch>/boot`; required for source builds |
| `clang_version` | Toolchain version under `prebuilts/clang/host/linux-x86` |
| `clang_path` | Custom Clang directory; takes precedence over `clang_version` |
| `rust_version` | Optional Rust toolchain version |
| `clang_triple` | Override the default `CLANG_TRIPLE` |
| `cross_compile` | `CROSS_COMPILE` passed to Kbuild |
| `cc` / `ld` | Override the default C compiler or linker |
| `autofdo_profile` | AutoFDO profile path; searches for a GKI profile by default, and `none` disables it |
| `rbe_wrapper` | Complete `rewrapper` command; uses `kernel_rbe_cc.sh` for the actual compilation when set |
| `make_command` | Override the tree-local `make` command |
| `build_jobs` | Override Kbuild `-j` parallelism |
| `make_flags` | Variables or arguments passed to every Kbuild invocation |
| `additional_flags` | Additional device-specific Kbuild configuration arguments |
| `environment` | Additional environment assignments passed to the Kbuild action |
| `srcs` | Additional analysis-time inputs; does not replace the source directory dependency |

The default Kbuild parallelism is calculated as `(logical CPU count + 2) * 3 / 2`, using
integer arithmetic. Lower `build_jobs` only when the host lacks memory or the kernel has
concurrency issues.

When `clang_version` and `rust_version` are not set explicitly, the values exported by
envsetup, `LLVM_AOSP_PREBUILTS_VERSION` and `RUST_AOSP_PREBUILTS_VERSION`, are preferred.
They fall back to `clang-stable` and no additional Rust toolchain path respectively.

Every entry in `environment` must be `NAME=value` and becomes an environment variable for
the Kbuild action. Use `make_flags` or `additional_flags` to pass Make variables.

## Kconfig

```bp
config: {
    defconfig: "gki_defconfig",
    fragments: [
        "vendor/common.config",
        "vendor/device.config",
    ],
    merge_at_once: true,
    overrides: [
        "CONFIG_EXAMPLE=y",
    ],
    lto: "thin",
},
```

Configuration is processed in this order:

1. initialize `.config` from `defconfig`;
2. run `olddefconfig`;
3. merge `fragments` sequentially or all at once;
4. modify LTO options according to `lto`;
5. append `overrides`;
6. run Kconfig's default-value processing one final time.

`lto` supports `none`, `thin`, and `full`. Verify the final fragment and override result
through the generated `.config`, rather than checking source files alone.

Configuration names without `/`, and names beginning with `vendor/`, resolve as follows:

```text
<kernel_dir>/arch/<config_arch>/configs/<name>
```

Other names containing `/` resolve from the Android source root. For example,
`kernel/vendor/foo.config` points directly to a file under the source root. The `x86_64`
defconfig directory is still converted to `arch/x86/configs`.

## DTB and DTBO

```bp
dtb: {
    enabled: true,
    qcom_merge: true,
    target: "dtbs",
    image_name: "dtb.img",
},
dtbo: {
    enabled: true,
    target: "dtbs",
    image_name: "dtbo.img",
    page_size: 4096,
},
```

| Property | Description |
| --- | --- |
| `enabled` | Enable this class of device-tree output |
| `qcom_merge` | Use uwuAOSP's QCOM DT merge flow |
| `src` | Prebuilt DTB/DTBO input |
| `target` | Target passed to Kbuild; defaults to `dtbs` or `dtbo.img` |
| `image_name` | Output name; defaults to `dtb.img` or `dtbo.img` |
| `config` | Configuration file used by `mkdtboimg cfg_create` |
| `input_globs` | Glob used to collect DT files when Kbuild does not generate the final image directly |
| `page_size` | Page size for `mkdtboimg create`; defaults to 4096 |
| `custom_command` | Command used when the standard flow cannot cover the device |

`dtb.src` and `dtbo.src` apply only to prebuilt kernels. Source builds should collect
device-tree outputs through a Kbuild target or `input_globs`. `dtb.config` and
`dtb.page_size` are not currently supported. QCOM merge mode uses `dtb.target`;
`dtbo.target` has no effect and is ignored.

`custom_command` may use `$(kernelDir)`, `$(kernelOut)`, and `$(out)`. It should be a last
resort; repeated flows should be implemented as common capabilities.

When `qcom_merge` is enabled, both `dtb.enabled` and `dtbo.enabled` must be true. The QCOM
merge flow creates a separate merge working directory from the kernel DTS output, then
generates DTB and DTBO separately. Kbuild itself continues to use the shared
`kernel_build` output directory.

## Modules

```bp
modules: {
    enabled: true,
    build_targets: ["modules"],
    external_module_root: "kernel/vendor/device-modules",
    external_modules: [
        "vendor/example",
        "vendor/kbuild-module:kbuild",
    ],
    install_strip: true,
    auto_collect_deps: true,
    system_dlkm_module_install_list: ["modules.include.system_dlkm"],
    system_dlkm_module_load_list: ["modules.load.system_dlkm"],
    vendor_dlkm_module_install_list: ["modules.include.vendor_dlkm"],
    vendor_dlkm_module_load_list: ["modules.load.vendor_dlkm"],
    recovery_module_install_list: ["modules.include.recovery"],
    recovery_module_load_list: ["modules.load.recovery"],
},
```

Module installation sets support `system_dlkm`, `vendor_dlkm`, `vendor_ramdisk`, and
`recovery`. Every class must provide both an install list and a load list; the load list
must be a subset of the install list. Each class may also define a blocklist.

Normal `external_modules` entries are built with the external module's own Makefile;
entries with the `:kbuild` suffix use the kernel Kbuild `M=` mode. `module_aliases` uses
the `old_name.ko:new_name.ko` format. `auto_collect_deps` adds dependencies discovered
from generated modules to the installation set.

With `auto_collect_deps` enabled, the source tree must also contain
`lineage/scripts/collect-kernel-module-deps/collect-kernel-module-deps.py`. An internal
installer for a partition is created only when its install or load list is configured;
once one is configured, the other must be configured too. `vendor_dlkm` depends on the
system_dlkm installer when both are enabled.

The RBE wrapper covers only actual C and assembly compilation. Preprocessing, assembly,
dependency analysis, and other Clang calls still run locally. `rbe_wrapper` should include
the required rewrapper arguments, for example:

```bp
rbe_wrapper: "prebuilts/remoteexecution-client/live/rewrapper --labels=type=compile,lang=cpp,compiler=clang",
```

## Device configuration

The complete configuration should live in the device tree's `Android.bp`. This page only
shows the configuration model; it does not duplicate device-specific module manifests,
DT inputs, or kernel paths. Devices can choose different architectures, toolchains,
device-tree flows, and module partitions, but all should use the same `uwu_kernel` module
interface.
