# Kotj

Kotj is a local notes app built into uwuAOSP. It uses Kotlin, Jetpack Compose and Material 3, with the package name `com.lopleec.kotj`.

## System integration

`vendor/uwu/config/common.mk` adds `Kotj` to the common product package list. Phones, tablets and foldables using the uwuAOSP common configuration build and preinstall it from source. It is not a downloaded prebuilt APK.

Build only Kotj:

```sh
uni -j$(nproc) Kotj
```

## Features

- Rich text, headings, lists, checkboxes, tables and images.
- Categories, pinning, search, recently deleted notes and automatic cleanup.
- Import TXT, Markdown, RTF and DOCX.
- Export plain text, Markdown and DOCX.
- Encrypted notes protected by an independent password or Android system authentication.

## Data and privacy

Kotj does not request network access. Notes, attachments, categories and settings stay in the app-private storage; telemetry and note contents are not uploaded.

Password mode derives an AES-256 key with PBKDF2-HMAC-SHA256 and encrypts notes and attachments with AES-GCM. System-unlock mode wraps a random key with Android Keystore. Screenshots and recent-task previews are blocked while encrypted content is open.

Encrypted notes cannot be recovered after the independent password, system unlock key or app data is lost. A ROM update does not intentionally clear app data, but important content should still be exported before flashing.

## Upstream

The standalone source and complete usage guide are available at [UwUniverse/Kotj](https://github.com/UwUniverse/Kotj). uwuAOSP only integrates it into the system build and does not change its local storage or encryption boundary.
