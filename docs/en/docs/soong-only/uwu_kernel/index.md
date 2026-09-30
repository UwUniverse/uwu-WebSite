# uwu_kernel

`uwu_kernel` is the uwuAOSP module type for integrating kernel builds with Soong. It is intended to replace the legacy kernel build task.

`uwu_kernel` does not replace the kernel's own build system. Kbuild, Bazel, or another system still performs the kernel build; `uwu_kernel` connects that build process and its outputs to the Android build system.

## Why uwu_kernel is needed

The legacy kernel build task is the main obstacle to moving ordinary devices to Soong-only. Switching to Soong-only can greatly reduce build-graph generation time.

Legacy kernel module configuration spreads module install locations and load lists across multiple Make variables and files, with cross-references between them. As a result, it is difficult to determine directly from the configuration:

- which partition a module is ultimately installed to;
- why a module is installed;
- which modules are actually loaded during boot.

`uwu_kernel` does not preserve these implicit behaviors. Devices should declare the required kernel configuration, outputs, and module layout directly so that the final state can be determined from the device configuration.

## Migration

We recommend using uwuCLI for the initial migration. It reads the existing device configuration and generates the corresponding `uwu_kernel` configuration.

For kernel modules, uwuCLI parses the legacy module configuration and any referenced static module lists, then generates the corresponding install-list and load-list configuration. If the existing configuration cannot be converted reliably, uwuCLI reports a blocker instead of guessing the required module layout.

Review the automatically converted result.

For detailed steps, see [Migrating from a legacy kernel build](migration.md).

## Documentation

- [Migration guide](migration.md): migrate an existing device to `uwu_kernel`
- [Configuration reference](configuration.md): configuration properties supported by `uwu_kernel`
- [Outputs](outputs.md): kernel outputs available to other Soong modules
- [Troubleshooting](troubleshooting.md): common build and configuration issues

## Verified devices

`uwu_kernel` has completed build and boot validation with the following representative kernel configurations:

| Device | Kernel | Type | Kernel build system |
| --- | --- | --- | --- |
| OnePlus 6T (`fajita`) | 4.19 | non-GKI | Kbuild |
| OnePlus Ace 3 / 12R (`aston(c)`) | 5.15 | GKI | Kbuild |
| POCO F7 / Redmi Turbo 4 Pro (`onyx`) | 6.6 | GKI | Bazel |
