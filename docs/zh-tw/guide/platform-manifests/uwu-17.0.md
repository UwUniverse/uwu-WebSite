# uwuAOSP

1. 初始化

建議使用 release manifests 進行初始化：

```bash
repo init -u https://github.com/uwuAOSP/platform_vendor_uwu-versions.git -b main --git-lfs
```

也可以追蹤我們的開發儲存庫：

> [!NOTE]
> 開發分支可能不穩定。

```bash
repo init -u https://github.com/uwuAOSP/platform_manifests.git -b uwu-17.0 --git-lfs
```

2. 同步

```bash
repo sync -c -j$(nproc --all) --force-sync --force-checkout --no-clone-bundle --no-tags --optimized-fetch --prune
```

3. 設定建置環境

```bash
source build/envsetup.sh
```

```bash
lunch uwu_devicecode-cp2a-userdebug
```

> [!TIP]
> 如需移植新裝置，請參閱[網站上的說明](https://uwuaosp.uwuniverse.org/docs/bringup-17/)。

4. 建置 OTA 套件：

```bash
uni otapackage
```
