# ciallo

## 下載

1. 初始化：

```bash
repo init -u https://github.com/uwuAOSP/platform_manifests.git -b ciallo --git-lfs
```

2. 同步：

```bash
repo sync -c -j$(nproc --all) --force-sync --no-clone-bundle --no-tags
```

## 建置

1. 建置套件：

```bash
./rom-build.sh <devicecode>
```
