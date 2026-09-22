# System icons

System icons switch the icon resources used by the system interface. Two styles are currently available: the system default and PUI.

## Use it

Open **uwuAOSP Plus → Interface settings → System icons** and choose:

- **Default**: disable the uwuAOSP icon overlays and restore the original resources.
- **PUI**: enable the PUI-style system icons.

The system applies all compatible overlays in one OverlayManager transaction and saves the current selection. Settings, SystemUI, Launcher and other running surfaces may need to be reopened or their processes restarted before every change is visible.

## How it works

PUI icons are kept as source resources in `vendor/uwu/overlay/rro_packages/PUI` and built into mutable RROs with the ROM. The Settings page only controls installed overlays; it does not download, install or execute a third-party APK.

Only overlays that exist in the current product and pass compatibility checks are enabled. If the product does not include PUI resources, or OverlayManager rejects the transaction, the page shows a direct failure message and keeps the existing style.

The PUI resources come from **PUI Theme For Stock Android v17.0.218** by 天伞桜. uwuAOSP reorganizes them so they can be built as source overlays.
