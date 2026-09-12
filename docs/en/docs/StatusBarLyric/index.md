# Status bar lyrics

Status bar lyrics can show real-time lyrics for compatible music apps and optionally show translations at the same time.

## Configure

Before use:

- Enable the status bar lyrics master switch.
- Add music apps that are allowed to provide lyrics to the allowlist.
- Choose whether lyrics cover the leading side of the status bar or appear to the right of the clock.
- Enable translations and the app icon as needed.

The master switch is off by default and the allowlist is empty. An empty allowlist means that no app's lyrics are accepted.

## Display location

### Cover the left side of the status bar

When lyrics appear, they cover other content on the left half of the status bar to provide more room for the lyrics.

### To the right of the clock

The clock remains visible and lyrics appear on its right. When lyrics appear, the notification-app icon area is temporarily hidden. You can choose whether to show the icon of the app providing the lyrics.

The main lyrics and translation are both single-line scrolling text with a vertical switching animation when the lyrics update. Tapping or touching the lyrics hides them temporarily; they return after about 1.2 seconds.

## App compatibility

Music apps must support MediaSession, which is supported by most apps.
The system automatically obtains the lyrics and translation, when available, together with the music app's monochrome icon, and displays them in the selected location.
