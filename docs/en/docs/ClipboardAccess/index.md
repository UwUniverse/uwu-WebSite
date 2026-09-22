# Clipboard access permission

Clipboard access permission applies an additional user policy before an app reads from or writes to the system clipboard. It does not replace Android's existing permissions, AppOps checks or system exemptions. It makes its decision after those checks pass.

## Set a policy

Open **uwuAOSP Plus → Privacy & security → Clipboard access permission** to choose a policy for each app:

- **Allow**: keep Android's normal behavior.
- **Ask**: show a confirmation prompt when the app accesses the clipboard.
- **Deny**: reject the app's read and write requests.

Policies are stored in `Settings.Secure` by Android user and package name, so they survive a reboot. Apps without an explicit rule follow the global default.

## Access prompt

The prompt shows the app name and distinguishes read requests from write requests.

- With **Write a permanent rule** unchecked, a denial affects the current request and is throttled briefly to prevent repeated prompts; an allow decision grants temporary access for about 10 seconds.
- When it is checked, the result is saved as a persistent app rule.
- Closing the prompt or pressing Back denies the current request without saving a rule.

The system limits repeated prompts from the same app for a short period. The current clipboard call remains blocked until the user makes a decision.

## Scope

The policy covers text and clipboard data reads and writes handled by `ClipboardService`. Android's native exemptions for input methods, system components, the current foreground app and other trusted cases remain effective, so not every internal clipboard call opens a prompt.

Apps that depend on background clipboard reads may lose autofill, cross-device sync or clipboard history features when **Ask** or **Deny** is selected.
