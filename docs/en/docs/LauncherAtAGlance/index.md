# Launcher at a glance

Launcher at a glance shows the date, weather, next alarm, timers and current media at the top of the first home screen. It is part of the Launcher workspace and does not consume a normal widget slot.

## Displayed content

The default glance surface combines available data:

- Date, which opens Calendar when tapped.
- Current weather and forecast, which open the weather page when tapped.
- The next alarm.
- Running timers.
- Current media title, subtitle and artwork, which open the playback app when tapped.

When media is available, swipe horizontally between the glance and media pages. A page indicator appears only when there is more than one page. Date, locale, time zone, alarm and media changes refresh immediately.

## Settings

Open Launcher settings:

- **Show at a glance** controls the entire first-screen glance area and is enabled by default.
- **Use Smartspacer** allows an installed and authorized Smartspacer to provide cards and is disabled by default.

If Smartspacer is missing, disabled or fails its permission check, Launcher falls back to the built-in glance instead of leaving an empty area.

## Data sources

Date and alarm data come from Android system services. Weather, timer and media data are read through system-side providers. Launcher does not make its own weather network requests. If a device or product does not provide a data type, that item is hidden while the others remain visible.

Launcher settings and switches are included in Launcher preference backup. Clearing Launcher data restores the defaults.
