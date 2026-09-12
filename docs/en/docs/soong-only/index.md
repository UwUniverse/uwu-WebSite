# Soong-only build documentation

This documentation explains how uwuAOSP uses Soong to generate build targets, images,
and kernel artifacts while Android product configuration is still parsed by Make. It
also describes the configuration relationship between `uwu_kernel` and the legacy Make
kernel build system.

## Why use Soong-only

Soong aims to remove the dependency on Makefiles for generating Android build targets.
Product configuration can still use Make, while Soong generates build targets and Ninja
rules directly from the module graph, skipping Kati's main target-generation phase.

The main benefit of skipping Kati is lower build-analysis overhead. The goal described
in the official Soong documentation is to reduce analysis time by about half and improve
developer efficiency. This mainly affects build startup and dependency-graph analysis;
it does not skip compilation actions executed by Ninja or the Linux Kbuild invoked by
`uwu_kernel`.

Soong-only does not mean “remove all Make”. Make still handles product configuration and
variable expansion, but it no longer converts Android.mk targets into the main Ninja
graph.

## Documentation navigation

| Page | Contents |
| --- | --- |
| [Build flow](build-flow.md) | `PRODUCT_SOONG_ONLY`, configuration export, and the Soong build graph |
| [Image generation](image-generation.md) | fsgen, boot/DTBO/vbmeta/super images, and output locations |
| [Build validation](validation.md) | Validation commands, artifact checks, and incremental-build checks |
| [uwu_kernel build system](uwu_kernel/) | `uwu_kernel` page index and responsibility boundaries |

## Basic concepts

Soong-only does not completely remove Make. Product configuration still needs Make to
read product inheritance and generate Soong configuration variables. The difference is
that after product configuration completes, Soong generates the main build targets and
Ninja rules, and Kati's main target-generation phase is not run.

The required configuration for a product to use Soong-only is:

```make
PRODUCT_SOONG_ONLY := true
```

The mode can also be selected temporarily with command-line arguments:

```sh
m --soong-only <target>
m --no-soong-only <target>
```

`SOONG_ONLY=true` is the equivalent environment-variable entry point. Command-line
arguments take precedence over the product default.

Key device configuration is usually located in:

- `device/<vendor>/<device>/BoardConfig*.mk`: enable the Soong kernel and select the module;
- `device/<vendor>/<device>/Android.bp`: declare `uwu_kernel`;
- `device/<vendor>/<device>/device.mk`: install the kernel into the product;
- `vendor/uwu/config/BoardConfigSoong.mk`: export the kernel selection to Soong.

Whether an image is generated is determined by the product's partition configuration.
Do not infer that every image exists solely because Soong-only is enabled.

## Reference implementations

- Native Android Soong-only documentation: `build/soong/docs/soong_only.md`
- Soong best practices: `build/soong/docs/best_practices.md`
