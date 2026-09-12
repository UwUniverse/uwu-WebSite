# Soong-only build validation

## Before building

Initialize the environment and select a product from the source root:

```sh
source build/envsetup.sh
lunch uwu_device-cp2a-user
```

Use the product name defined by the device's `AndroidProducts.mk`. When validating
different devices, use that device's own partition and kernel configuration.

## Target validation

Build the main Soong-only targets first:

```sh
m --soong-only bootimage
m --soong-only dtboimage
m --soong-only superimage
m --soong-only vbmetaimage
```

A complete product build can use:

```sh
m --soong-only
```

If the product sets `PRODUCT_SOONG_ONLY := true`, `--soong-only` can also be omitted.

## Artifact checks

Check that the main outputs exist and are non-empty:

```sh
for image in kernel dtb.img dtbo.img boot.img init_boot.img vendor_boot.img \
        system.img vendor.img product.img super.img vbmeta.img \
        vbmeta_system.img vbmeta_vendor.img; do
    test -s "out/target/product/<device>/$image" || exit 1
done
```

Check the partitions and AVB parameters recorded in the product configuration:

```sh
grep -E '^(avb_|building_|dynamic_partition_list=|has_dtbo=|init_boot=|vendor_boot=)' \
    out/target/product/<device>/misc_info.txt
```

Use host tools that match the product configuration to check image formats. For example,
when AVB is configured:

```sh
avbtool info_image --image out/target/product/<device>/boot.img
avbtool info_image --image out/target/product/<device>/dtbo.img
```

## Kernel output checks

Soong intermediate outputs from `uwu_kernel` use module labels instead of hard-coded
device paths. During debugging, inspect the module directory for the current build:

```text
out/soong/.intermediates/device/<vendor>/<device>/kernel/<variant>/
```

Common output labels correspond to:

| Label | Actual content |
| --- | --- |
| Default output | Kernel image, such as `kernel/Image` |
| `.config` | `kernel_build/.config` |
| `.dtb` | `dtb/dtb.img` |
| `.dtbo` | `dtbo/dtbo.img` |
| `.modules` | Kernel module zip, generated when enabled and consumed by a target |
| generated headers | UAPI directories such as `headers/usr/include` |

For the final configuration, inspect the generated `.config`:

```sh
grep -E 'CONFIG_(<device-specific-options>|LTO_)' \
    out/soong/.intermediates/device/<vendor>/<device>/kernel/<variant>/kernel_build/.config
```

## Soong-only difference testing

Google's Soong documentation recommends comparing Soong-only with Soong+Make results.
After product configuration is complete, run:

```sh
build/soong/scripts/soong_only_diff_test.py <product>
```

The script runs both modes, builds target-files and image targets, and compares artifact
differences. Classify differences by partition, install path, file list, and image
metadata before deciding whether they come from device configuration or a missing Soong
migration.

## Incremental dependency checks

After changing kernel source, verify at least these two points:

1. the `kernel_image` action runs again;
2. unchanged Android partitions are not rebuilt unconditionally.

`uwu_kernel` tracks kernel source directories through `source_deps/source.d`. Do not
replace this with `srcs: ["**/*"]` as a directory dependency.

After changing UAPI headers, defconfig, fragments, DTB/DTBO configuration, or the module
manifest, confirm that the corresponding headers, configuration, device-tree, or module
action runs again.
