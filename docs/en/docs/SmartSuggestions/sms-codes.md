# SMS code suggestions

After a regular SMS containing a recognized verification code is received, the system shows
a code overlay with copy and fill actions.

## Enable and configure

Go to **uwuSettingsExt → Intelligence → Smart suggestions** and enable SMS code
suggestions.

On the rules page you can enable, add, edit, delete, or reset code rules. The system checks
rules in order and uses the first match.

## Actions

- **Copy**: write the code to the clipboard without showing the regular clipboard overlay again.
- **Fill**: try to submit the code to the currently focused input field.

SMS code suggestions do not have a fixed timeout. The overlay disappears after copying,
successfully filling, swiping it away, or being dismissed by the system.

## Scope

- Only regular SMS is handled; port SMS and notifications from other messaging apps are not.
- Fill depends on the current input method and whether the focused input field accepts text.
- A failed fill does not automatically fall back to copying; the user can still choose Copy.
- Suggestions do not appear on the lock screen and are not replayed after unlocking.
- No suggestion appears when a rule is invalid or the SMS content does not match a rule.
