# 快速开始

## 构建uwuAOSP

如果你发现没有对应您机型的 OTA 包或者想要自行开发，那么可以看看这个。

对于构建 16.2 的用户，您需要手动 bringup（也就是将您的 lineage 设备树适配到 uwuAOSP 上）。请放心，这不会很难，只是改一小部分。

对应构建 17.0 的用户，我们会在正式发布时跟随发布 uwuAOSP-Script。你只需要 clone 到本地 uwuAOSP 源码目录并执行即可完成适配。

## 准备源码

### 1.准备uwuAOSP源码和设备树源码

你可以在 Github 上寻找对应你设备 CodeName 的设备树源码并 clone 到 uwuAOSP 源码目录对应位置。

## uwuAOSP

### Downloading:

1. Initialize:

```bash
repo init -u https://github.com/uwuAOSP/platform_manifests.git -b uwu-16.2 --git-lfs
```

2. Sync:

```bash
repo sync
```

### Building

1. Setup environment:

```bash
source build/envsetup.sh
```

2. lunch device:

```bash
lunch custom_devicecode-bp4a-user
```

3. Build the package:

```bash
m uwu
```
