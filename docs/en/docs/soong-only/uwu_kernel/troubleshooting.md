# uwu_kernel troubleshooting

## Kernel changes do not trigger a rebuild

First confirm that the changed file is under `kernel_dir`. If you changed an external module, confirm that it is under `external_module_root`.

`uwu_kernel` tracks source changes in these directories. Declare files with `srcs` only when they are outside these directories but are still required as kernel build inputs.

Do not use:

```bp
srcs: ["**/*"],
```

Expanding the entire source tree into Soong inputs significantly increases Soong analysis and build-graph generation overhead. If source dependencies are not tracked correctly, first check `kernel_dir`, `external_module_root`, and the actual source locations.

## External module build fails

First confirm that `external_module_root` and `external_modules` point to the correct locations.

Normal external modules are built using their own Makefile. If a module needs the main kernel Kbuild `M=` mode, use the `:kbuild` suffix:

```bp
external_modules: [
    "vendor/example:kbuild",
],
```

If the module builds but is not installed correctly, also check whether its generated `.ko` file is in the module outputs that `uwu_kernel` can collect.

## Kernel module is not installed to the expected partition

Check whether the module is included in the install list for the partition. `uwu_kernel` supports `system_dlkm`, `vendor_dlkm`, `vendor_ramdisk`, and `recovery`.

The install list determines whether a module is installed to a partition; the load list determines which installed modules are loaded. Do not add a module to the load list just to install it.

When `auto_collect_deps` is enabled, dependencies are added automatically based on the install list. Otherwise, ensure that the required dependencies are included in the install set.

## Kernel module is not loaded

First confirm that the module is installed to the expected partition, then check whether it is in that partition's load list.

`uwu_kernel` requires:

```text
load list ⊆ install list
```

The build fails if the load list contains a module that is not installed to the corresponding partition.

If the module is installed and listed for loading but does not load after boot, check the generated `modules.load`, module dependencies, blocklist, and device boot logs. The issue is then usually not with the `uwu_kernel` module layout configuration itself.

## DTB or DTBO build fails

Confirm that the corresponding output is enabled, and check that `target`, `input_globs`, and the actual Kbuild outputs match.

When using `qcom_merge`, both `dtb.enabled` and `dtbo.enabled` must be enabled. This mode uses `dtb.target` to build the device tree, then completes the DTB/DTBO merge using the generated DTS outputs.

If the device uses a non-standard device-tree layout, first check whether it can be described with `target` or `input_globs`. Use `custom_command` only when the standard flow cannot cover it.

## Kernel configuration differs from expectations

Check the final generated `.config`, not only the source defconfig, fragments, or `overrides`.

Kconfig processes defaults after merging fragments, applying LTO configuration, and appending overrides. The final `.config` is the configuration actually used for the kernel build.
