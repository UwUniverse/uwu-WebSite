# Quick start

## Build uwuAOSP

This page is for cases where you cannot find an OTA package for your device or want to develop it yourself.

16.2: You need to perform a manual bring-up (that is, adapt your `lineage_` device tree to uwuAOSP). This only involves a simple rename from `lineage_` to `custom_`.

17.0: Use uwuCLI to convert your device tree. If you encounter any problems, please open an Issue in [uwuCLI](https://github.com/UwUniverse/uwuCLI).

## Sign a release OTA

Initialize keys once from the source tree. The destination must be outside the source tree and must not exist yet:

```sh
uni --init-signing-keys ~/.android-certs
```

If you already generated keys manually, skip initialization. After `lunch`, use the same directory for every release:

```sh
uni otapackage --sign-keys ~/.android-certs
```

uni builds `target-files-package` and `otatools`, signs APKs/APEXes and the OTA, then writes a SHA-256 checksum. For a uni-initialized directory, it creates and reuses APEX keys based on the target-files metadata; manually created key directories are not modified. Signed artifacts are stored under `out/release/<product>/`. Additional APK and AVB keys require device-specific configuration; see the [uni signing guide](/en/docs/uni/#signing-a-release-ota).

Back up the key directory securely on separate storage. Deleting the source tree leaves the keys intact. Newly generated keys cannot continue ordinary OTA updates for devices that trust the old keys.

To validate an existing target-files package in an isolated directory:

```sh
uni --sign-keys ~/.android-certs --sign-check
```

## Configure OTA updates

The native updater checks a maintainer-provided HTTPS source for new builds. Signing creates the update package; it does not upload the file or publish an update list.

1. Add a resource overlay directory to the device tree's product Makefile:

   ```make
   PRODUCT_PACKAGE_OVERLAYS += device/<vendor>/<device>/overlay
   ```

2. In that directory, create `packages/apps/Updater/app/src/main/res/values/config.xml` with the update source:

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <string name="updater_server_url" translatable="false">https://ota.example.org/{device}/{type}.json</string>
   </resources>
   ```

   Replace the device tree path and example domain. `{device}` resolves to the device codename, and `{type}` to the lowercase release channel. A fixed URL also works.

3. Upload the final signed OTA ZIP and publish a JSON array at the update source. Include the target version, build timestamp, channel, direct download URL, byte size, SHA-256, and SDK level. Return `[]` when there are no updates.
4. Build and install the configured system, then verify checking, downloading, and installation in **Settings > System > System updates**.

For the complete schema, streaming setup, and verification commands, see [Configure OTA updates (Chinese)](/docs/bringup-17/#ota-updates). Local import remains available without an online source. The website's release notes page is not an OTA update source.
