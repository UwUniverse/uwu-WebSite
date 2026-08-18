# Quick start

## Build uwuAOSP

If you cannot find an OTA package for your device or want to develop it yourself, this is where to start.

For users building 16.2, you need to perform a manual bring-up. This means adapting your Lineage device tree to uwuAOSP. Do not worry; only a small part needs to be changed.

For users building 17.0, we will release uwuAOSP-Script alongside the official release. Clone it into the local uwuAOSP source directory and run it to complete the adaptation.

## Prepare the source

### 1. Prepare the uwuAOSP source and device tree source

Find the device tree source for your device CodeName on GitHub and clone it into the corresponding location in the uwuAOSP source directory.

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
