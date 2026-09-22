# Per-app volume

Per-app volume provides an independent gain for apps that are currently playing audio without changing the global media volume. It is useful when music, games, navigation or call-assistance audio play at the same time.

## Enable it

Open **Settings → Sound & vibration → Audio → Control volume for specific apps**. The switch is disabled by default.

When enabled, the system volume panel shows the per-app volume entry. It lists apps with active playback tracks and lets you set each app from 0 to 100. An app may temporarily disappear after it stops playback and releases its audio track.

## How it works

SystemUI obtains the active app audio tracks from AudioManager and converts the 0–100 UI value to the `0.0–1.0` gain used by AudioFlinger. During mixing, AudioFlinger multiplies the app gain with the media-stream and port volume values. Therefore:

- Lowering one app does not change other apps.
- The system media volume still controls the final overall loudness.
- A new playback track from the same package inherits the app gain kept by the running AudioFlinger process.

The interface is protected by `MODIFY_AUDIO_ROUTING`; ordinary third-party apps cannot change another app's volume directly.

## Limitations

App gains are kept in AudioFlinger runtime state rather than as long-term user settings. They return to their defaults after the audio service or device restarts. Apps without an independent audio track, using a special direct path or playing through another process may not appear under their expected name.
