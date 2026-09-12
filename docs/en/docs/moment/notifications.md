# Open notifications

After enabling “Open notifications in Moment”, tapping the body of an eligible notification
opens its target page as a Moment.

An “Open fullscreen” button appears at the lower right of the notification. Tapping it
forces the same content to open fullscreen, even when the app already has a Moment task.

## Orientation options

Notification opening can be controlled independently for:

- Portrait
- Landscape

After the device rotates, existing notifications update their tap behavior and lower-right
button for the current orientation.

## Supported scope

- The Activity page supplied by the notification is preferred.
- If the notification has no valid Activity entry, the app's main page is attempted.
- Regular, media, ongoing, heads-up, and lock-screen notifications are supported.
- Group summaries, custom notification layouts, and notifications without a launchable Activity keep their original behavior.
- On the lock screen and in a separate work profile, authentication is completed before the selected window mode is used.
- Only notifications declared as auto-cancel disappear automatically after a successful open.

After the master switch or the current orientation option is disabled, notifications return
to Android's original tap and bubble behavior.
