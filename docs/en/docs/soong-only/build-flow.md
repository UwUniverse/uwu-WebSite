# Soong-only build flow

## Processing stages

A normal Soong-only product build can be divided into the following stages:

```text
Product configuration Makefiles
        |
        v
runMakeProductConfig
        |
        +--> soong_config.mk exports JSON product variables
        |
        v
soong_ui selects Soong-only
        |
        v
soong_build analyzes Android.bp and generated modules
        |
        +--> uwu_kernel generates kernel, DTB, DTBO, headers, and modules
        |
        +--> fsgen generates filesystem, boot, super, and vbmeta modules
        |
        v
Ninja executes build actions
        |
        v
android_device copies images and installed files to PRODUCT_OUT
```

## Where Kati is skipped

After product configuration completes, Soong-only skips Kati's two main stages:

- `skipKati`: do not run Kati to generate regular Make build targets;
- `skipKatiNinja`: do not use Kati-generated Ninja files as the main build input.

`soong_ui` still runs product configuration because Soong needs device, partition, AVB,
and product-package variables from the product Makefiles. Target generation is skipped;
product-variable reading is not.

This avoids reanalyzing and converting Android.mk on every build. According to the Soong
documentation, the goal of Soong-only is to reduce build-analysis time by about half and
improve developer efficiency. Actual compilation time still depends on the Ninja
dependency graph, source changes, cache hit rate, and host resources.

## Product configuration stage

`build/soong/ui/build/build.go` still calls product configuration first. This stage parses:

- `PRODUCT_SOONG_ONLY`;
- `PRODUCT_PACKAGES` and `PRODUCT_COPY_FILES`;
- partition, AVB, boot, and kernel variables in `BoardConfig.mk`;
- `SOONG_CONFIG_*` namespace variables.

Soong-only products must therefore keep their product Makefiles parseable. Soong-only
replaces the Make target-generation stage, not the product-configuration language itself.

## Mode selection

`build/soong/ui/build/config.go` handles three entry points:

| Entry point | Effect |
| --- | --- |
| `PRODUCT_SOONG_ONLY := true` | Use Soong-only by default for the product |
| `SOONG_ONLY=true` | Request Soong-only through the environment |
| `--soong-only` | Request Soong-only for the current build |

Soong-only mode sets `skipKati` and `skipKatiNinja`. Make variables already read during
product configuration are still used to generate Soong configuration and select the target
device.

## Bridging Make configuration to Soong

`build/make/core/soong_config.mk` writes BoardConfig and product variables to the Soong
product-variable JSON. The main kernel and image-related values include:

- `PartitionQualifiedVariables`: build switches, filesystem, size, and AVB parameters for each partition;
- `BoardUsesSoongKernel`: whether the Soong kernel is used;
- `BoardAvbMakeVbmetaImageArgs`: additional vbmeta arguments;
- `BoardKernelPagesize`: page size related to boot/DTBO;
- `PartitionVarsForSoongMigrationOnlyDoNotUse`: product variables still supplied by Make during migration.

These values are read on the Soong side through `android.Config().ProductVariables()`.
Device code should not establish dependencies by reading files under
`out/soong/.intermediates` directly.

## Soong module analysis

`soong_build` analyzes all relevant `Android.bp` files, then module load hooks create
derived modules. In `build/soong/fsgen/filesystem_creator.go`, `filesystemCreator`:

1. creates filesystem modules from partition variables;
2. creates boot, init_boot, vendor_boot, and vendor_kernel_boot modules;
3. creates DTBO, super, and vbmeta modules;
4. creates `android_device` to collect image and target-files dependencies;
5. creates phony aliases for traditional image targets when Kati is disabled.

## Output stage

In Soong-only mode, `android_device` copies filesystems and images to
`$(PRODUCT_OUT)` and connects the main device all-images stamp to
`droidcore-unbundled`. This lets `m droid` continue to build the product's default outputs.

Image aliases include:

```text
systemimage
bootimage
initbootimage
vendorbootimage
dtboimage
superimage
vbmetaimage
```

An alias is created only when the corresponding module and partition actually exist.
Targets such as `vendorkernelbootimage` must not be hard-coded into validation scripts
when the corresponding partition is not configured.
