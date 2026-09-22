# Device maintainer metadata

A device tree can declare the maintainer responsible for building and adapting the product. A valid value is written to a read-only system property and appears below the app updates item in **Settings → System → Software updates**.

## Device-tree configuration

Set the value in the product `.mk` file before inheriting `vendor/uwu/config/common.mk`:

```make
UWU_MAINTAINER := bk233
```

The build system generates:

```text
ro.uwu.maintainer=bk233
```

An empty value does not generate the property, and Settings hides the empty item. Names are limited to 64 characters and may contain letters, numbers, spaces, dots, underscores, hyphens and `@`.

## Migration tool

When migrating a LineageOS product tree to uwuAOSP, the maintainer can be written at the same time:

```sh
uwu product migrate lineage apply \
  --device nabu \
  --type tablet \
  --no-telephony \
  --maintainer bk233
```

Interactive mode also asks for the maintainer name. Use `plan` or `--dry-run` to inspect the changes before editing the device tree.

## Display rules

Software updates reads `ro.uwu.maintainer` and displays **Maintainer** in English or **维护者** in Chinese. This field identifies the product maintainer; it does not participate in OTA identity checks, signing or update-channel selection.
