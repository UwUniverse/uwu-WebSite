# uwu_kernel outputs

`uwu_kernel` provides kernel build artifacts to other modules through Soong output labels.

## Output labels

| Label | Output |
| --- | --- |
| Default label | Kernel image |
| `.config` | Final kernel configuration |
| `.dtb` | DTB image |
| `.dtbo` | DTBO image |
| `.modules` | Kernel modules archive |

For example, a `uwu_kernel` module named `kernel` can be referenced as follows:

```text
:kernel
:kernel{.config}
:kernel{.dtb}
:kernel{.dtbo}
:kernel{.modules}
```

Labels other than the default kernel image are available only when the corresponding output exists. For example, `.dtbo` is available only when DTBO output is enabled.

Device configuration and other Soong modules should reference kernel outputs through these labels. Do not depend on specific paths under `out/soong/.intermediates`.

## Kernel headers

Kernel UAPI headers are not exposed through an output label. `uwu_kernel` runs Kbuild `headers_install`, cleans the generated headers, and provides them to other modules through the Generated headers interface.

`generated_kernel_includes` uses the headers provided by the `uwu_kernel` selected by `SOONG_KERNEL_MODULE`. This maintains compatibility with libraries in the current Android tree that depend on `generated_kernel_includes`.

## Kernel modules

When kernel modules are enabled, `.modules` provides an archive of the built kernel modules. `uwu_kernel` creates the corresponding partition module installers based on the install lists, load lists, and blocklists declared in `modules`.

Devices do not need to add these internal installers directly. Add the main `uwu_kernel` module to the product:

```device.mk
PRODUCT_PACKAGES += kernel
```

For kernel module partition and load configuration, see the [configuration reference](configuration.md).
