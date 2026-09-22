# uwu-17.0-wip

1. Initialize the repository:

```bash
repo init -u https://github.com/uwuAOSP/platform_manifests.git -b uwu-17.0 --git-lfs
```

2. Synchronize the source tree:

```bash
repo sync -c -j$(nproc --all) --force-sync --no-clone-bundle --no-tags --optimized-fetch --prune
```

3. Set up the build environment:

```bash
source build/envsetup.sh
```

```bash
lunch custom_devicecode-cp2a-userdebug
```

4. Build the package:

```bash
m uwu
```
