# uwuBackGroundManager

uwuBackGroundManager manages background behavior per app. It can freeze idle apps or increase the background retention level of apps that need to keep working.

## App modes

- **Default**: applies no uwuAOSP policy and uses Android's native background management.
- **Tombstone**: freezes the process when the app is idle, preserving memory state and stopping CPU execution.
- **Full**: does not freeze the app, limits its OOM priority to the “perceptible app” level, and adds it to the Device Idle allowlist.

Policies are stored in `Settings.Secure` per user and package. `system_server` listens for configuration changes and applies the mode to processes under the same UID.

Tombstone mode tracks visible activities, foreground services, broadcasts, executing services, Instrumentation, audio playback and recording, location, VPN, Binder activity, and AOSP freezer exemptions. When a protected state ends, eligible apps return to the freeze queue. When a Binder request arrives, the system first unfreezes the entire UID, then freezes it again after the request completes and the app becomes idle. It does not terminate a frozen process using AOSP's default path.

Full mode reduces process reclamation and Doze restrictions, but does not guarantee that an app will stay alive indefinitely. Force-stop, crashes, voluntary exit, and severe memory pressure can still end the process.

## Freezer backends

Settings provides automatic, CGroup1, CGroup2, and hybrid backends. The system reads the cgroup mount layout and freezer capabilities:

- **Automatic** selects an available backend based on the device's actual layout.
- Manual options unsupported by the current kernel are disabled.
- If the selected backend becomes unavailable or the layout changes, the framework falls back to an available backend. Tombstone freezing is not performed when no freezer is available.

Tombstone mode also requires the Binder driver to support `BINDER_FREEZE`, `BINDER_GET_FROZEN_INFO`, and frozen-transaction tracking. Defining ioctl numbers without implementing them in the driver is not sufficient. Full mode does not require these freezing interfaces.

## Recent tasks

“Ignore launcher task card removal” applies only to Tombstone and Full apps. Swiping the card away from Recents removes the card, but the task and process may remain. Force-stopping the app still ends it.

## Diagnostic logs

The Settings page can export background-management logs. Logs use `[INFO]`, `[WARN]`, and `[ERROR]` levels and include build information, app policies, requested and active freezer backends, cgroup controllers and mounts, Binder nodes, kernel freezer state, and framework events. Export reads local state only; it does not upload files.

## Kernel requirements

- CGroup1 requires a writable freezer controller.
- CGroup2 requires writable `cgroup.freeze`.
- The Android Binder driver must provide a freezing UAPI compatible with userspace.
- The Android userspace freezer must be enabled and able to access the relevant cgroup hierarchy.

This feature was inspired by [Cirno](https://github.com/Freezer-Team/Cirno.git).
