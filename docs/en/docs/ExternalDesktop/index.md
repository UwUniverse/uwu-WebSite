# External desktop

External desktop hands USB-C, HDMI and supported virtual displays to Android desktop mode. Apps run as movable, resizable freeform windows on the external display, while the system desktop mode provides the taskbar and window title bars.

## Enable it

Open **uwuAOSP Plus → System & desktop → External desktop** and enable the master switch.

The page also provides two independent options:

- **Cover the built-in display**: show a black connection message on the built-in display while the external desktop is active, then restore it after the last external display disconnects.
- **Allow scrcpy virtual displays**: allow a trusted display created by `scrcpy --new-display` to enter desktop mode. Normal screen mirroring does not change the built-in layout.

## Use it

Connect a USB-C or HDMI display that supports video output. The system directs keyboard and mouse focus to the external desktop. A scrcpy build with new-display support can also be used:

```sh
scrcpy --new-display=1920x1080
```

Supported projection displays are treated as tablet desktop displays. The system calculates a suitable density and orientation for narrow or portrait devices. It reuses Android's freeform windows, taskbar, title bars and task management instead of running a second desktop environment.

## Disconnect recovery

After the last external desktop display disconnects, the system:

- Removes the black built-in-display message.
- Restores built-in display and touch interaction.
- Returns focus to the built-in display.
- Ends desktop sessions belonging only to the removed display.

Apps without freeform or multi-display support may still run at a constrained size, fixed orientation or in compatibility mode.
