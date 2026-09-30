# uwu_kernel configuration reference

## Top-level properties

| Property | Description |
| --- | --- |
| `kernel_dir` | Kernel source directory relative to the Android source root; required for source builds |
| `prebuilt` | Prebuilt kernel path; skips source Kbuild when set |
| `prebuilt_config` | Generated `.config` file; used only with `prebuilt` |
| `prebuilt_headers` | Gzip-compressed kernel UAPI headers archive; used only with `prebuilt` |
| `prebuilt_modules` | Prebuilt kernel modules zip; used only with `prebuilt` |
| `kernel_arch` | Kbuild architecture, such as `arm64` |
| `image_name` | Kernel filename under `arch/<arch>/boot`; required for source builds |
| `clang_version` | Toolchain version under `prebuilts/clang/host/linux-x86` |
| `clang_path` | Custom Clang directory; takes precedence over `clang_version` |
| `rust_version` | Optional Rust toolchain version |
| `clang_triple` | Override for the default `CLANG_TRIPLE` |
| `cross_compile` | `CROSS_COMPILE` value passed to Kbuild |
| `cc` / `ld` | Override for the default C compiler or linker |
| `autofdo_profile` | AutoFDO profile path; searches for a GKI profile by default, or set to `none` to disable |
| `rbe_wrapper` | Complete `rewrapper` command; uses `kernel_rbe_cc.sh` for compilation when set |
| `make_command` | Override for the tree-local `make` command |
| `build_jobs` | Override for Kbuild `-j` parallelism |
| `make_flags` | Variables or arguments passed to all Kbuild invocations |
| `additional_flags` | Additional device-specific Kbuild arguments; mainly for migrating `TARGET_KERNEL_ADDITIONAL_FLAGS` |
| `environment` | Additional environment assignments passed to the Kbuild action |
| `srcs` | Additional analysis-time inputs; does not replace the source directory dependency |

The default Kbuild parallelism is calculated using integer arithmetic: `(logical CPU count + 2) * 3 / 2`.

If `clang_version` and `rust_version` are not explicitly set, uwu_kernel prefers `LLVM_AOSP_PREBUILTS_VERSION` and `RUST_AOSP_PREBUILTS_VERSION` exported by envsetup. Clang then falls back to `clang-stable`. If no Rust version is set, no Rust toolchain path is added.

Each `environment` entry must use the `NAME=value` format and becomes a shell environment variable for the Kbuild action. Use `make_flags` or `additional_flags` to pass Make variables.

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
6. run `olddefconfig` again.

`lto` supports `none`, `thin`, and `full`. Verify the final fragment and override results in the generated `.config`, rather than checking only the source files.

Configuration names without `/`, and names beginning with `vendor/`, resolve under:

```text
<kernel_dir>/arch/<config_arch>/configs/<name>
```

Other valid configuration paths can resolve relative to the Android source root. For example, `kernel/vendor/foo.config` points to a file under the source root. The `x86_64` defconfig directory is still converted to `arch/x86/configs`.

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
| `enabled` | Enable this type of device-tree output |
| `qcom_merge` | Use uwuAOSP's QCOM DT merge flow |
| `src` | Prebuilt DTB/DTBO input |
| `target` | Kbuild target; defaults to `dtbs` or `dtbo.img` |
| `image_name` | Output name; defaults to `dtb.img` or `dtbo.img` |
| `config` | Configuration file used by `mkdtboimg cfg_create` |
| `input_globs` | Glob used to collect DT files when Kbuild does not generate the final image directly |
| `page_size` | Page size for `mkdtboimg create`; defaults to 4096 |
| `custom_command` | Command for cases the standard flow cannot handle |

`dtb.src` and `dtbo.src` are only for prebuilt kernels. Source builds should collect device-tree outputs through a Kbuild target or `input_globs`. `dtb.config` and `dtb.page_size` are not currently supported.

`custom_command` can use `$(kernelDir)`, `$(kernelOut)`, and `$(out)`. Use it only as a last resort; repeated flows should be implemented as a common capability.

When `qcom_merge` is enabled, both `dtb.enabled` and `dtbo.enabled` must be `true`. QCOM merge runs Kbuild using `dtb.target`, creates a separate merge working directory from the kernel DTS outputs, then generates DTB and DTBO. `dtbo.target` is not used in this mode.

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

Module install sets support `system_dlkm`, `vendor_dlkm`, `vendor_ramdisk`, and `recovery`. Each class must have both an install list and a load list; the load list must be a subset of the install list. Each class can also define a corresponding blocklist.

Normal `external_modules` entries are built using the external module's own Makefile, with the default target `all`; `:all` explicitly selects the same behavior. Entries with the `:kbuild` suffix use the main kernel Kbuild `M=` mode.

`module_aliases` uses the `old_name.ko:new_name.ko` format.

When `auto_collect_deps` is enabled, `uwu_kernel` collects dependencies of modules in the install list and adds them to the final install set. This requires `lineage/scripts/collect-kernel-module-deps/collect-kernel-module-deps.py` in the source tree.

`vendor_dlkm_install_all` adds all built modules not installed to `system_dlkm` to the `vendor_dlkm` install list.

A partition installer is created only when its install list or load list is configured. If one is configured, the other must also be configured. When `system_dlkm` is enabled, `vendor_dlkm` depends on the system_dlkm installer.

## RBE wrapper

The RBE wrapper applies only to actual C and assembly source compilation. Other Clang calls, including preprocessing, `-S`, and dependency generation, still run locally.

`rbe_wrapper` should include the required rewrapper arguments. For example:

```bp
rbe_wrapper: "prebuilts/remoteexecution-client/live/rewrapper --labels=type=compile,lang=cpp,compiler=clang",
```
