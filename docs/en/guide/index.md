# Quick start

## Build uwuAOSP

This page is for cases where you cannot find an OTA package for your device or want to develop it yourself.

16.2: You need to perform a manual bring-up (that is, adapt your `lineage_` device tree to uwuAOSP). This only involves a simple rename from `lineage_` to `custom_`.

17.0: Use uwuCLI to convert your device tree. If you encounter any problems, please open an Issue in [uwuCLI](https://github.com/UwUniverse/uwuCLI).

## Sign a release OTA

Uni can produce a signed OTA after creating target files. The key directory must contain these four key pairs:

```text
releasekey.pk8       releasekey.x509.pem
platform.pk8         platform.x509.pem
shared.pk8           shared.x509.pem
media.pk8            media.x509.pem
```

After `lunch`, run:

```sh
uni -j$(nproc) otapackage --sign-keys ~/android-certs
```

Uni builds `target-files-package` and `otatools`, signs APKs/APEXes and the OTA, then writes a SHA-256 checksum. Signed artifacts are stored under `out/release/<product>/`. Keys are read only during signing and are not written into the source tree or ordinary build outputs.

To validate an existing target-files package in an isolated directory:

```sh
uni --sign-keys ~/android-certs --sign-check
```
