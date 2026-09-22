# wip/uwu-16.2-tesseract-ocr-deps

## Download

1. Initialize the repository:

```bash
repo init -u https://github.com/uwuAOSP/platform_manifests.git -b uwu-16.2 --git-lfs
```

2. Synchronize the source tree:

```bash
repo sync
```

## Build

1. Set up the build environment:

```bash
source build/envsetup.sh
```

2. Select a device:

```bash
lunch custom_devicecode-bp4a-user
```

3. Build the package:

```bash
m uwu
```
