---
title: uwuAOSP 17.0.181
description: uwuAOSP 17.0.181
aside: false
outline: false
changelogBranch: uwu-17.0.181
---

<ReleaseBlog locale="en-US" mode="article" release="uwu-17.0.181" />

- Clipboard interception now temporarily preserves pending writes, so you no longer need to retry clipboard write requests after granting permission.
- Significantly improved animations in the split Quick Settings (QS) layout.
- Added part2 to the boot animation.
- Refactored sensor, clipboard, and app launch controls:
You can now manage these permissions directly through the Permissions entry on each app's info page, without having to open uwuSettingsExt.
- Fixed double-tap-to-sleep on the status bar.
- Renamed the ParanoidSense build flag. To use face unlock service provided by your device's HAL, specify:
TARGET_USES_NATIVE_FACEUNLOCK := true
- Introduced a brand-new system updater.
- Rewrote the uwuCompose component library.
- Redesigned the CatShare icon.
- Fixed icon rendering issues with custom icon packs.
- Merged the September and October 2026 security updates to enhance system security.
- Updated the Go prebuilt toolchain to 1.26.10 for improved build performance.
- Reworked memory allocation. Together with Green Tea GC, which is enabled by default in Go 1.26.10, source cache refreshes and fingerprint calculations are approximately 15% faster, while cumulative memory allocations have been reduced by 27%.
- Improved iconloaderlib's ability to automatically detect and process icons.
