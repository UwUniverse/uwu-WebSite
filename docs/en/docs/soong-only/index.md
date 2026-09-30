# Soong-only

Generating the Android build graph includes a serial Kati stage. Kati processes Make build rules and generates the corresponding Ninja build rules.

LineageOS noted in its 23.2 release blog:

> LineageOS is now nearly Android.mk free! Google announced their move from make to
> soong many years ago, pushing developers to migrate from Android.mk to Android.bp,
> and has started blocking Android.mk in many locations of the source tree.

However, some core build components still depend on Make, so Kati remains a required part of the build process.

uwuAOSP continues this migration by completing the final step, allowing modern devices to skip Kati's main build-graph generation stage. In our tests, this nearly halves build-graph generation time. Product configuration, such as BoardConfig, still uses Make; Soong-only does not mean that Makefiles cannot be used in the device tree.

## Migrate a device

uwuAOSP has already handled most of the build components required for Soong-only on modern devices. Device bringup usually only requires migrating the following:

- [`uwu_kernel`](uwu_kernel/): replaces the legacy kernel build task;
- `uwu_prebuilt_image`: replaces `$(call add-radio-file, ...)` in the Make layer.

uwuCLI provides a migration script to simplify device bringup. After the script performs the mechanical conversion, review and validate the generated build rules.

To enable Soong-only temporarily, set the environment variable:

```bash
export SOONG_ONLY=true
```

You can also set it in the product configuration:

```make
PRODUCT_SOONG_ONLY := true
```

> [!NOTE]
> A-only devices depend on `//bootable/deprecated-ota:updater`, which has not yet been migrated. Soong-only cannot currently be used on these devices. If you need support for them, please open an issue in the issue tracker.

## Validation

After migration, complete at least one full build and confirm that the device boots and its main functions work. Do not determine whether migration succeeded by checking against a fixed list of images.

The following devices have completed Soong-only build and boot validation:

- OnePlus 6T (`fajita`)
- OnePlus Ace 3 / 12R (`aston(c)`)
