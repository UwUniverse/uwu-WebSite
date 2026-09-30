# Migrate from a legacy kernel build to uwu_kernel

## Use uwuCLI

We recommend using uwuCLI for the initial conversion:

```bash
uwu
```

Follow the prompts to select the device and kernel migration.

uwuCLI reads the existing device configuration and converts the kernel build settings where possible. The generated configuration may not be final. After migration, check that the kernel configuration, DTB/DTBO, and kernel modules match the device.

## Kernel

Legacy kernel builds commonly use these variables to specify the kernel:

```make
TARGET_KERNEL_SOURCE := kernel/<vendor>/<kernel>
TARGET_KERNEL_ARCH := arm64
BOARD_KERNEL_IMAGE_NAME := Image
```

After migration, declare this information directly in the `uwu_kernel` module:

```bp
uwu_kernel {
    name: "kernel",

    kernel_dir: "kernel/<vendor>/<kernel>",
    kernel_arch: "arm64",
    image_name: "Image",
}
```

Declare toolchains, additional Kbuild flags, and other special settings only when the device requires them. See the [configuration reference](configuration.md) for all properties.

## Kernel configuration

Legacy kernel builds can use variables such as `TARGET_KERNEL_CONFIG` and `TARGET_KERNEL_ADDITIONAL_FLAGS` to specify the kernel configuration and additional build flags. For example:

```make
TARGET_KERNEL_CONFIG := \
    gki_defconfig \
    vendor/device.config

TARGET_KERNEL_ADDITIONAL_FLAGS := \
    CONFIG_EXAMPLE=y
```

After migration, express the same configuration directly:

```bp
additional_flags: [
    "CONFIG_EXAMPLE=y",
],

config: {
    defconfig: "gki_defconfig",
    fragments: [
        "vendor/device.config",
    ],
},
```

## DTB and DTBO

For a standard device, declare the outputs directly:

```bp
dtb: {
    enabled: true,
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

To use Qualcomm DT merge, set `qcom_merge` under `dtb`. When enabled, both `dtb.enabled` and `dtbo.enabled` must be `true`:

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

## Kernel modules

Kernel modules require the most manual review during migration.

Legacy kernel builds spread module install locations and load lists across multiple Make variables and external lists, with cross-references between them. For example, a device may use:

```make
BOARD_SYSTEM_KERNEL_MODULES_LOAD
BOARD_VENDOR_KERNEL_MODULES_LOAD
BOARD_VENDOR_RAMDISK_KERNEL_MODULES_LOAD
BOOT_KERNEL_MODULES
SYSTEM_KERNEL_MODULES
```

`uwu_kernel` does not use these legacy variables. For each partition that needs kernel modules installed, specify both:

1. the install list: which modules belong in the partition;
2. the load list: which modules should be loaded from that partition.

For example:

```bp
modules: {
    enabled: true,

    system_dlkm_module_install_list: [
        "modules.include.system_dlkm",
    ],
    system_dlkm_module_load_list: [
        "modules.load.system_dlkm",
    ],

    vendor_dlkm_module_install_list: [
        "modules.include.vendor_dlkm",
    ],
    vendor_dlkm_module_load_list: [
        "modules.load.vendor_dlkm",
    ],
},
```

The install list describes **what the partition contains**; the load list describes **what should be loaded**. Therefore:

```text
load list ⊆ install list
```

`uwu_kernel` checks this relationship during the build. The build fails if a module in the load list is missing from the corresponding install list. A module is not automatically installed just because it appears in a load list.

This is intentional: the final module layout should be clear from the device configuration without having to infer rules.

uwuCLI parses legacy kernel module configuration and referenced static module lists, then generates the install-list and load-list configuration. If the existing configuration cannot be converted reliably, uwuCLI reports that instead. Review the generated lists to confirm they match the device.

### Automatically collect module dependencies

The install list does not need to enumerate every dependency. With `auto_collect_deps` enabled, `uwu_kernel` collects dependencies of the listed modules and adds them to the final install list:

```bp
modules: {
    enabled: true,
    auto_collect_deps: true,

    vendor_dlkm_module_install_list: [
        "modules.include.vendor_dlkm",
    ],
    vendor_dlkm_module_load_list: [
        "modules.load.vendor_dlkm",
    ],
},
```

`auto_collect_deps` only adds module dependencies required by the install list. It does not infer which modules to install from the load list. Explicitly specify the install and load lists required by the device.

### External modules

If the device uses external modules outside the main kernel tree, specify the external module root and the modules to build:

```bp
modules: {
    enabled: true,

    external_module_root: "kernel/<vendor>/<device>-modules",
    external_modules: [
        "vendor/example",
    ],
},
```

By default, `uwu_kernel` builds an external module with its own build system and provides information such as the kernel source and output directories.

If an external module is part of the main kernel Kbuild tree and must be built using Kbuild's `M=` mode, append `:kbuild` to its path:

```bp
modules: {
    enabled: true,

    external_module_root: "kernel/<vendor>/<device>-modules",
    external_modules: [
        "vendor/example:kbuild",
    ],
},
```

This is equivalent to running `M=<module> modules` and the corresponding `modules_install` through the main kernel build system. Do not copy additional Make rules just to preserve the legacy build structure.

For module properties and supported configuration, see the [configuration reference](configuration.md).

## Connect to the Android build

After defining `uwu_kernel`, configure the Android build to use the module.

Select the Soong kernel in the device configuration:

```make
BOARD_USES_SOONG_KERNEL := true
SOONG_KERNEL_MODULE := //device/<vendor>/<device>:kernel
```

Then add the kernel to the product:

```make
PRODUCT_PACKAGES += kernel
```

Other modules should reference kernel artifacts through the public `uwu_kernel` outputs. Do not depend on specific paths under `out/soong/.intermediates`.

See [Outputs](outputs.md) for available outputs.

## Settings that cannot be migrated automatically

Some legacy settings describe more than kernel build parameters and cannot be safely converted mechanically. Common examples include:

- custom DTB/DTBO Makefiles;
- scripts that depend on specific `KERNEL_OUT`, `DTB_OUT`, or `DTBO_OUT` paths;
- platform-specific kernel build wrappers.

For these settings, first determine the intended result, then express that result with `uwu_kernel`.

Do not recreate the same implicit rules in Soong just to reproduce the legacy Make implementation line by line.

If multiple devices need behavior that `uwu_kernel` cannot currently express, open an issue in the Issue Tracker.

## Validation

After migration, start with a normal build:

```bash
uni
```

At minimum, confirm that:

- the kernel image builds successfully;
- the final `.config` matches expectations for the device;
- DTB/DTBO are generated and the device boots;
- kernel modules are installed to the correct partitions;
- module load lists match boot requirements;
- the device boots and works correctly.

For common issues, see [Troubleshooting](troubleshooting.md).
