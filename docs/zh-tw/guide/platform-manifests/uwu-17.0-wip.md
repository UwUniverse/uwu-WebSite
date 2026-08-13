# uwu-17.0-wip

1. 初始化

```bash
repo init -u https://github.com/uwuAOSP/platform_manifests.git -b uwu-17.0 --git-lfs
```

2. 同步

```bash
repo sync -c -j$(nproc --all) --force-sync --no-clone-bundle --no-tags --optimized-fetch --prune
```

3. 建置

```bash
source build/envsetup.sh
```

```bash
lunch custom_devicecode-cp2a-userdebug
```

```bash
m uwu
```
