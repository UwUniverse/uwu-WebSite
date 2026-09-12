# App jump injection control

App jump injection controls the behavior of one app opening a page in another app. Examples include a web page opening a shopping app, a content app launching a store, or apps launching one another.

## Enable

Go to **uwuSettingsExt → App jump injection**. The master switch is enabled by default. Turning it off pauses all rules without deleting them.

## Configure rules

Jump behavior can be configured from three perspectives:

- Rules used when an app acts as the source and opens another app.
- Rules used when an app acts as the target and is opened by another app.
- An exact source-app → target-app pair.

Each rule can be set to:

- **Always allow**: open the target page directly.
- **Ask**: show a confirmation dialog before jumping.
- **Always block**: stop the jump and show a brief message.

An exact pair rule takes precedence over general source and target rules.

## Confirmation dialog

The dialog shows the names and icons of the source and target apps. After Allow or Don't allow is selected, the current jump is handled accordingly.

Selecting “Remember my choice” saves the result as a pair rule for these two apps. Without it, the result applies only to the current jump. Clicking outside the dialog or pressing Back cancels the operation; the target app is not opened and no rule is saved.

## Scope

This feature manages Activity launches only. It does not block Service, Broadcast, Provider, Binder, or network communication. Pages within the same app, system sources, the launcher, the system resolver, permission controllers, file or photo pickers, and other required flows are exempt.

Launches that return a result to the source page generally retain Android's original behavior. Uninstalling an app does not automatically remove old rules; they may apply again when the same package name is reinstalled.
