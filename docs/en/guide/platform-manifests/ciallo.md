# ciallo

## Download

1. Initialize the repository:

```bash
repo init -u https://github.com/uwuAOSP/platform_manifests.git -b ciallo --git-lfs
```

2. Synchronize the source tree:

```bash
repo sync -c -j$(nproc --all) --force-sync --no-clone-bundle --no-tags
```

## Build

1. Build the package:

```bash
./rom-build.sh <devicecode>
```
