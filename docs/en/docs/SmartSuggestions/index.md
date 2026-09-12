# Smart suggestions

Smart suggestions show quick actions based on current content or device state, reducing
the steps needed to copy, switch apps, or find a feature manually.

Go to **uwuSettingsExt → Intelligence → Smart suggestions** to enable each suggestion
type separately. All suggestions are disabled by default. The first visit prepares default
clipboard and verification-code rules but does not enable the features automatically.

## Suggestion types

- [Clipboard app suggestions](./clipboard-apps.md): suggest a matching app after a link or text is copied.
- [SMS code suggestions](./sms-codes.md): provide copy or fill actions after an SMS verification code is received.
- [Flashlight suggestions](./torch.md): provide a quick turn-off action while the flashlight is on.
- [Music suggestions](./music.md): suggest a selected music app after headphones are connected.

## Display behavior

Smart suggestions reuse the system clipboard overlay and are not notifications. A new
suggestion replaces the current overlay and does not return after SystemUI restarts.

Suggestions appear only when the device is unlocked and the required user settings are
complete. Suggestions missed on the lock screen are not shown again after unlocking.

## Scope

Smart suggestions provide quick actions only. They do not automatically open an app, fill
in a code, turn off the flashlight, or play music. A suggestion may not appear or may fail
to complete when the target app is missing, the input field does not accept filling, the
content does not match a rule, or the device lacks the required capability.
