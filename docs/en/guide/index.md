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
uni -j$(nproc) otapackage --sign-keys ~/android-certs
```

Uni builds `target-files-package` and `otatools`, signs APKs/APEXes and the OTA, then writes a SHA-256 checksum. For a Uni-initialized directory, it creates and reuses APEX keys based on the target-files metadata; manually created key directories are not modified. Signed artifacts are stored under `out/release/<product>/`. Additional APK and AVB keys require device-specific configuration; see the [Uni signing guide](/en/docs/uni/#signing-a-release-ota).

Back up the key directory securely on separate storage. Deleting the source tree leaves the keys intact. Newly generated keys cannot continue ordinary OTA updates for devices that trust the old keys.

To validate an existing target-files package in an isolated directory:

```sh
uni --sign-keys ~/android-certs --sign-check
```
