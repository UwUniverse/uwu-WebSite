# Migrating from Make kernel builds to uwu_kernel

## Migration principles

The legacy `vendor/uwu/build/tasks/kernel.mk` uses global variables, implicit Make rules,
and several shared intermediate directories. `uwu_kernel` changes Android-side
orchestration to a declarative module, while Kconfig, Kbuild, DTS, and module compilation
remain the responsibility of the kernel source.

Migration is not a mechanical conversion of variable names to lowercase properties.
First determine whether each old variable controls:

- kernel source and toolchain;
- Kconfig inputs;
- DTB/DTBO outputs;
- kernel-module building or installation;
- Android boot or partition images.

## Converting configuration locations

| Legacy Make configuration | `uwu_kernel` configuration | Description |
| --- | --- | --- |
| `TARGET_KERNEL_SOURCE` | `kernel_dir` | Source directory relative to the Android root |
| `KERNEL_ARCH` / `TARGET_KERNEL_ARCH` | `kernel_arch` | Kbuild architecture |
| `BOARD_KERNEL_IMAGE_NAME` | `image_name` | Output filename under `arch/<arch>/boot` |
| `TARGET_PREBUILT_KERNEL` | `prebuilt` | Use a prebuilt kernel and skip source builds |
| Prebuilt kernel config | `prebuilt_config` | Provide the `.config` output |
| Prebuilt kernel headers archive | `prebuilt_headers` | Provide the UAPI headers provider |
| Prebuilt kernel modules zip | `prebuilt_modules` | Provide `.modules` output and partition installer |
| First `TARGET_KERNEL_CONFIG` entry | `config.defconfig` | Base defconfig |
| Remaining `TARGET_KERNEL_CONFIG` entries | `config.fragments` | Fragments merged in order |
| `TARGET_KERNEL_CONFIG_EXT` | `config.fragments` | Migrate to an explicit path in the source tree |
| `KERNEL_CONFIG_OVERRIDE` | `config.overrides` | Configuration lines appended at the end |
| `MERGE_ALL_KERNEL_CONFIGS_AT_ONCE` | `config.merge_at_once` | Merge fragments all at once or one by one |
| `KERNEL_LTO` | `config.lto` | `none`, `thin`, or `full` |
| `TARGET_KERNEL_CLANG_VERSION` | `clang_version` | Clang version inside the tree |
| `TARGET_KERNEL_CLANG_PATH` | `clang_path` | Custom Clang path |
| `KERNEL_CLANG_TRIPLE` | `clang_triple` | Override the target triple |
| `KERNEL_CROSS_COMPILE` | `cross_compile` | Cross-toolchain prefix |
| `KERNEL_CC` | `cc`, `ld`, or `make_flags` | Split old values containing both `CC=` and `LD=` before filling these fields |
| `KERNEL_MAKE_CMD` | `make_command` | Make used by Kbuild |
| `KERNEL_MAKE_FLAGS` | `make_flags` | Passed to every Kbuild invocation |
| `TARGET_KERNEL_ADDITIONAL_FLAGS` | `additional_flags` | Additional device Kbuild flags |
| `CLANG_AUTOFDO_PROFILE` | `autofdo_profile` | AutoFDO profile; a GKI profile may be used by default |
| Kernel rewrapper configuration | `rbe_wrapper` | Wrap actual compilation actions only |
| `TARGET_KERNEL_MIXED_MODE` | Device and partition configuration | No longer a global switch for the kernel action |

`TARGET_KERNEL_VERSION` is usually not a kernel compilation parameter. QCOM platform and
HAL selection logic may still use it; keep it and set it as required by the platform.

## Converting DTB/DTBO settings

| Legacy Make configuration | `uwu_kernel` configuration |
| --- | --- |
| `BOARD_DTB_CFG` | `dtb.config` |
| `BOARD_DTBO_CFG` | `dtbo.config` |
| `BOARD_KERNEL_SEPARATED_DTBO` | `dtbo.enabled` and device DT configuration |
| `TARGET_MERGE_DTBS_WILDCARD` | `dtb.input_globs` |
| `TARGET_DTB_LIST_WILDCARD` | `dtb.input_globs` |
| `TARGET_MERGE_DTBOS_WILDCARD` | `dtbo.input_globs` |
| `TARGET_DTBO_LIST_WILDCARD` | `dtbo.input_globs` |
| `BOARD_CUSTOM_DTBIMG_MK` | `dtb.custom_command` or common Soong capability |
| `BOARD_CUSTOM_DTBOIMG_MK` | `dtbo.custom_command` or common Soong capability |
| QCOM merge-DTB script | `dtb.qcom_merge: true`, with both DTB/DTBO enabled |
| `BOARD_KERNEL_PAGESIZE` | Android boot/DTBO partition configuration; DTBO uses `page_size` |

Old Make variables sometimes express only whether a rule is entered, while the new
properties must also express actual inputs, outputs, and targets. Check generated commands
and image contents instead of checking only whether properties exist.

## Converting modules

The old system spreads module building, install partitions, and load manifests across
multiple variables. The new system groups them under `modules`:

| Legacy Make configuration | `modules` property |
| --- | --- |
| `BOARD_KERNEL_MODULES` / kernel `modules` target | `build_targets` |
| `TARGET_KERNEL_EXT_MODULE_ROOT` | `external_module_root` |
| External module list | `external_modules` |
| `*_KERNEL_MODULES_LOAD` | Corresponding `*_module_load_list` |
| `*_KERNEL_MODULES` or include manifest | Corresponding `*_module_install_list` |
| `BOARD_*_KERNEL_MODULES_BLOCKLIST` | Corresponding `*_module_blocklist` |
| `TARGET_AUTO_COLLECT_KERNEL_MODULE_DEPS` | `auto_collect_deps` |
| `BOARD_KERNEL_MODULES_LOAD_ALLOW_MISSING` | `allow_missing_load` |
| Module file rename rules | `module_aliases` |
| `NEED_KERNEL_MODULE_ROOT` | Declare again for the actual partition; do not migrate directly |
| `NEED_KERNEL_MODULE_SYSTEM` | `system_dlkm` or the actual system install property |
| `NEED_KERNEL_MODULE_VENDOR_OVERLAY` | Remodel as the corresponding filesystem dependency |

`install_list` and `load_list` must both exist, and every module in the load list must
appear in the install list. Manifests may use paths; Soong validates and generates results
by module basename.

## Device conversion example

Connect the Soong kernel from the device's `BoardConfig.mk` and `device.mk`:

```make
# BoardConfig.mk
BOARD_USES_SOONG_KERNEL := true
SOONG_KERNEL_MODULE := //device/<vendor>/<device>:kernel

# device.mk
ifeq ($(BOARD_USES_SOONG_KERNEL),true)
PRODUCT_PACKAGES += kernel
endif
```

The corresponding Android.bp declares the kernel, DTB, DTBO, modules, configuration, and
toolchain:

```bp
uwu_kernel {
    name: "kernel",
    kernel_dir: "kernel/<vendor>/<kernel>",
    kernel_arch: "arm64",
    image_name: "Image",
    clang_version: "clang-r<version>",
    additional_flags: [
        "CONFIG_DEVICE_DTB=y",
    ],
    config: {
        defconfig: "gki_defconfig",
        fragments: [
            "vendor/common.config",
            "vendor/device.config",
        ],
    },
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
}
```

## Configuration that cannot be converted directly

The following legacy settings require manual judgment:

- `TARGET_KERNEL_PLATFORM_TARGET`: external kernel-platform/Kleaf orchestration, not equivalent to `kernel_dir`;
- old Make RBE global variables do not migrate automatically; set `rbe_wrapper` explicitly in the module;
- custom DTB/DTBO Makefiles should first be covered by common `uwu_kernel` capabilities;
- `NEED_KERNEL_MODULE_*` changes both Android install paths and partition dependencies;
- independent Makefiles for external modules require a choice between a normal external module and `:kbuild`;
- configurations or manifests generated through `$(shell)` must become explicit Soong action inputs and outputs;
- scripts that depend on concrete `KERNEL_OUT`, `DTB_OUT`, or `DTBO_OUT` paths should use module labels instead.

After migration, remove legacy kernel compilation variables taken over by `uwu_kernel`, but
keep variables still required by the Android platform, boot image, HAL namespace, or
partition configuration.

## Validation

At minimum, a migration change should verify:

1. the default kernel output and `boot.img` are generated;
2. `.config` contains the base configuration, fragments, overrides, and LTO result;
3. DTB/DTBO inputs, merge method, page size, and final images are correct;
4. kernel headers can be consumed by `generated_kernel_includes`;
5. module building, install sets, load lists, and blocklists are correct;
6. source, UAPI header, configuration, and manifest changes trigger the corresponding incremental actions;
7. target-files or image differences between Soong-only and Soong+Make are explainable.
