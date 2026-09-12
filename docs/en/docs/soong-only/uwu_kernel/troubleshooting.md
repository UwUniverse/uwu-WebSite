# uwu_kernel troubleshooting

## Kernel module not found

Confirm that `SOONG_KERNEL_MODULE` is set during the BoardConfig stage and that its module
name matches Android.bp:

```make
BOARD_USES_SOONG_KERNEL := true
SOONG_KERNEL_MODULE := //device/<vendor>/<device>:kernel
```

Also confirm that the product contains:

```make
PRODUCT_PACKAGES += kernel
```

Do not set `SOONG_KERNEL_MODULE` only at the end of a product Makefile. The Soong mutator
and fsgen need to read it during module analysis.

## Configuration file not found

Configuration names without a slash resolve to:

```text
<kernel_dir>/arch/<config_arch>/configs/<name>
```

Names containing a path resolve from the source root. For example, `vendor/common.config`
means the file at that path under the source root. The `x86_64` defconfig directory is
converted to `arch/x86/configs`.

Check that `config.defconfig` and every fragment exist, and that fragment order does not
depend on implicit variable expansion from the old Make flow.

For a `prebuilt` kernel, source configuration properties are not executed. Set
`prebuilt_config`, `prebuilt_headers`, and `prebuilt_modules` separately to provide the
corresponding outputs.

## Source changes do not trigger a rebuild

Check:

1. whether the changed file is under `kernel_dir` or `external_module_root`;
2. whether `source_deps/source.d` includes the corresponding directory;
3. whether an intermediate file under `out/soong` was edited manually;
4. whether the source is outside directory dependencies without being added to `srcs`;
5. whether an external script has overwritten an action's output timestamp.

Do not solve this with `srcs: ["**/*"]`. Correct the source root or add the smallest
necessary additional input.

## Headers are not updated

Confirm that `generated_kernel_includes` depends on the current `uwu_kernel`, not
`generated_kernel_includes_legacy`. Then inspect:

```text
out/soong/.intermediates/device/<vendor>/<device>/kernel/
  <variant>/headers.timestamp
out/soong/.intermediates/device/<vendor>/<device>/kernel/
  <variant>/source_deps/source.d
```

The headers action runs Kbuild `headers_install`, followed by
`vendor/uwu/build/tools/clean_headers.sh`. If the action ran but the result is incomplete,
check the kernel UAPI export rules instead of copying headers manually.

## DTB or DTBO failure

Check these items in order:

- whether `dtb.enabled` and `dtbo.enabled` satisfy the `qcom_merge` requirements;
- whether the Kbuild `target` actually generates the corresponding DT files;
- whether `input_globs` matches the real output;
- whether DTBO `page_size` matches BoardConfig and bootloader requirements;
- whether `custom_command` uses valid `$(kernelDir)`, `$(kernelOut)`, and `$(out)` values;
- when using QCOM merge, whether the `merge_dtbs.py` input directory contains the base DTB and techpack DT.

Do not edit generated `.dtb` or `.dtbo` files directly.

## Modules build successfully but are not installed

Confirm that each module appears in both the corresponding install list and load list.
Also check:

- whether the module belongs to `system_dlkm`, `vendor_dlkm`, `vendor_ramdisk`, or `recovery`;
- whether `external_module_root` is correct;
- whether a normal external module should use `path:kbuild` instead;
- whether `module_aliases` uses `old.ko:new.ko`;
- whether `auto_collect_deps` needs to be enabled;
- whether a blocklist incorrectly uses a path instead of the module basename.

Do not add internally generated `kernel_modules_*` modules to `PRODUCT_PACKAGES` manually.

## Toolchain or Perl errors

Check whether the action uses the tree-local toolchain and tool paths. Common problems
include:

- `clang_version` does not exist;
- custom `clang_path` lacks `bin` or `lib`;
- `DTC_EXT` points to the wrong host output;
- an external module depends on the host system Perl;
- `make_command` points to a tool that does not support the current Kbuild arguments.

Fix module properties first instead of reconstructing a second PATH in the device Makefile.

When `rbe_wrapper` is enabled, confirm that it is a complete rewrapper command and that
the build environment sets `TOP`.
