# ciallo

## Downloading:

1. Initialize:

```bash
repo init -u https://github.com/uwuAOSP/platform_manifests.git -b ciallo --git-lfs
```

2. Sync:

```bash
repo sync -c -j$(nproc --all) --force-sync --no-clone-bundle --no-tags
```

## Building

1. Build the package:

```bash
./rom-build.sh <devicecode>
```
