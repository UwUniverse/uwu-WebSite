# uwu-16.2

## 下載

1. 初始化：

```bash
repo init -u https://github.com/uwuAOSP/platform_manifests.git -b uwu-16.2 --git-lfs
```

2. 同步：

```bash
repo sync
```

## 建置

1. 設定環境：

```bash
source build/envsetup.sh
```

2. lunch 裝置：

```bash
lunch custom_devicecode-bp4a-user
```

3. 建置套件：

```bash
m uwu
```
