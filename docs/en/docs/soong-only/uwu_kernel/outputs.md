# uwu_kernel outputs and dependencies

## Output labels

`uwu_kernel` exposes artifacts through Soong output labels:

| Label | Output | Main consumers |
| --- | --- | --- |
| Default label `""` | Kernel image | fsgen bootimg, `android_device` |
| `.config` | Final Kconfig file | Debugging and configuration validation |
| `.dtb` | DTB image | Boot image and device validation |
| `.dtbo` | DTBO image | fsgen DTBO and vbmeta |
| `.modules` | Kernel modules zip | Partition module installer |

Source kernels generate `.config`, headers, DTB, DTBO, and modules according to enabled
properties. Prebuilt kernels do not run Kbuild; they provide corresponding outputs only
when `prebuilt_config`, `prebuilt_headers`, `dtb.src`, `dtbo.src`, or `prebuilt_modules`
is configured.

Device configuration should reference labels through the module, for example:

```text
:kernel
:kernel{.dtb}
:kernel{.dtbo}
:kernel{.modules}
```

Do not put concrete paths under `out/soong/.intermediates` into Android.bp or Makefiles.

## Kernel action

Source builds create an independent `kernel_build` output directory and establish these
dependencies:

1. create directory-dependency stamps for the kernel source and external modules;
2. generate `.config` from configuration inputs, then run `headers_install` and clean UAPI headers from source inputs;
3. make the kernel image action depend on `.config` and the source-dependency stamp;
4. make DTB/DTBO actions depend on the kernel image, DTS outputs, and source-dependency stamp;
5. make the modules action depend on kernel/DT outputs, then compile, install, and package kernel modules.

Each action declares the previous stage's outputs as explicit dependencies. DT, module, and
header actions therefore cannot drift outside the kernel-image build graph.

When `autofdo_profile` is enabled, the profile is also an explicit input to the kernel,
DT, and modules actions. When `rbe_wrapper` is enabled, the wrapper script is likewise an
action input.

## Toolchain

Default Kbuild calls use tools from the tree:

- Clang: `prebuilts/clang/host/linux-x86/<version>/bin`;
- build tools: `prebuilts/build-tools/linux-x86/bin`;
- kernel tools: `prebuilts/kernel-build-tools/linux-x86/bin`;
- Lineage tools: `prebuilts/tools-lineage/linux-x86/bin`;
- Perl base modules: `prebuilts/tools-lineage/common/perl-base`.

The action explicitly sets `LLVM=1`, `LLVM_IAS=1`, `DTC_EXT`, `LZ4`, `LEX`, `YACC`, `M4`,
`PAHOLE`, `LIBCLANG_PATH`, `CC`, and `LD`. This prevents kernel builds from depending on
whatever tool versions happen to be installed in the host distribution.

## Source dependencies

Soong directory-dependency rules generate `source_deps/source.d`. Kernel source and
configuration files are action inputs, while the source directory is a directory
dependency. New or modified kernel files can therefore trigger the relevant action without
expanding the entire source tree into every Ninja rule.

`srcs` is only for additional files outside directory dependencies. Do not use:

```bp
srcs: ["**/*"],
```

That pattern increases Soong analysis memory, Ninja file size, and reanalysis cost.

## UAPI headers

`uwu_kernel` runs Kbuild `headers_install`, then
`vendor/uwu/build/tools/clean_headers.sh`. The shared `generated_kernel_includes` module
forwards headers from the module selected by `SOONG_KERNEL_MODULE`; unmigrated devices
fall back to `generated_kernel_includes_legacy`.

Prebuilt kernels can use the same headers provider through `prebuilt_headers`; the archive
must be a gzip-compressed tar archive.

Native modules continue to depend on `generated_kernel_includes` and do not need to switch
to a concrete device intermediate directory.

## Modules zip and partition installers

The `.modules` output is a zip containing installation results, load lists, and blocklists.
`uwu_kernel` creates internal `PrebuiltKernelModules` modules from the manifests of four
partition classes, and fsgen connects those modules to the corresponding filesystem or
ramdisk.

These internal modules are not public product modules for direct addition to device
configuration. Declare manifests in `uwu_kernel.modules` and install the main module with
`PRODUCT_PACKAGES += kernel`.

## Intermediate outputs

The main kernel intermediate directory for a device build is usually:

```text
out/soong/.intermediates/device/<vendor>/<device>/kernel/<variant>/
```

It may contain `kernel/<image_name>`, `kernel_build/.config`, `dtb/<image_name>`,
`dtbo/<image_name>`, `headers/`, and `source_deps/source.d`. Treat these as validation
clues, not a stable API.
