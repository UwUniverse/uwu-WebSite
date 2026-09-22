# Custom fonts

Custom fonts register an imported font with Android's font service and override the system `sans-serif` family. Newly launched apps use the selected font; a reboot updates all system surfaces.

## Import fonts

Open **uwuAOSP Plus → Interface settings → Custom fonts** to select:

- A single TTF or OTF font.
- A ZIP archive containing multiple TTF or OTF files.

ZIP files are extracted locally. Valid fonts are kept in the app-private `CustomTTF` directory and listed by PostScript name, weight and style. Damaged files, non-font files and files with an invalid signature are ignored.

To prevent a malformed archive from exhausting storage, importing is limited to 256 archive entries, 128 fonts, 64 MiB per font and 256 MiB total font data.

## Preview and apply

After selecting a font, the page renders this preview with it:

```text
老人正夢見獅子。
The quick brown fox jumps over the lazy dog.
0123456789
いろはにほへと ちりぬるを
```

Tap **Apply selected font**. The system font service validates and installs the font. If it fails, the page shows a direct reason such as an invalid file, unsupported signature, insufficient storage or an unavailable font service instead of only an internal error code.

## Restore the default font

Selecting **Restore default font** removes the system font override and clears imported files from `CustomTTF`. Newly launched apps then use the system font; rebooting updates every surface.

Font files are processed locally and are not uploaded. Apps that bundle their own fonts or draw their own resources may not follow the system font.
