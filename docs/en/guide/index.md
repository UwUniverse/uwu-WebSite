# Quick start

## Build uwuAOSP

If there is no OTA package for your device, or you want to develop it yourself, start here.

For users building 16.2, you need to bring up the device manually. This means adapting your Lineage device tree to uwuAOSP. It should not be difficult; only a small part needs to be changed.

For users building 17.0, uwuAOSP-Script will be released with the official release. Clone it into the local uwuAOSP source directory and run it to complete the adaptation.

## Prepare the source

### 1. Prepare the uwuAOSP source and device tree source

Find the device tree source for your device CodeName on Github and clone it into the corresponding location in the uwuAOSP source directory.

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
