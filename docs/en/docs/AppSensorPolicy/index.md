# App sensor access

App sensor access can restrict a selected app from reading motion and environmental sensor data provided by Android SensorService.

## Set a policy

Go to **uwuSettingsExt → App sensor access**, search by app name or package name, and choose:

- **Allow all**: add no extra restriction.
- **Block for 6 seconds after opening**: temporarily block sensor access for 6 seconds each time the app comes to the foreground.
- **Block permanently**: keep blocking until the policy is changed.

“Block for 6 seconds after opening” starts its timer again whenever the app returns to the foreground. The system does not replay data missed while the restriction was active.

## Impact

Affected apps may be unable to read the accelerometer, gyroscope, proximity, orientation, and other data provided through SensorManager or direct sensor channels.

This feature does not restrict:

- Camera or microphone.
- Location.
- Bluetooth or Wi-Fi scanning.
- UWB, NFC, or USB.
- App launches, network connections, or background execution itself.

Existing system permissions, AppOps, the global sensor privacy switch, and background restrictions continue to apply independently.

## Limitations

Policies are stored per Android user and package name. “Block for 6 seconds after opening” is triggered when the app Activity returns to the foreground, so invisible apps or service-only launches may not trigger it.

The settings page may show eligible system apps. Restricting a system component that depends on sensors may cause abnormal behavior; confirm the app's purpose before changing its policy.
