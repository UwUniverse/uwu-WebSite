# Landscape support

Moment adjusts its default size and movable area according to the current screen
orientation.

- Portrait uses a larger default scale.
- Landscape uses a smaller default scale to preserve room for app content, system bars, and controls.
- When returning from landscape to portrait, the system tries to restore the window scale from before the landscape transition.
- The window position is constrained to the safe area for the current orientation.
- A portrait app on a landscape display keeps a content scale suited to reading.

Notification-to-Moment behavior can also be enabled independently for portrait and
landscape.
