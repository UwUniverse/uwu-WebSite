# uwuAOSP

1. Initialize the repository:

```bash
repo init -u https://github.com/uwuAOSP/platform_manifests.git -b uwu-17.0 --git-lfs
```

2. Synchronize the source tree:

```bash
repo sync -c -j$(nproc --all) --force-sync --force-checkout --no-clone-bundle --no-tags --optimized-fetch --prune
```

3. Set up the build environment and select a device:

```bash
source build/envsetup.sh
lunch uwu_devicecode-cp2a-userdebug
```

> [!TIP]
> For a new device bring-up, run `./uwuCLI/uwu` and follow the interactive instructions.

4. Build an OTA package:

```bash
uni -j$(nproc) otapackage
```
