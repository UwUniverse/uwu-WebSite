# uwuAOSP Bringup Guide (17.0+)

This guide covers the minimum device tree changes required to build uwuAOSP, as well as optional improvements for a better development experience.

## Required (Phase 1)

For convenience, use uwuCLI for bringup:

```bash
uwu
```

Select a language, then choose “Migrate LineageOS product device tree”. The script will ask you a few questions.

The maintainer name entered for the third question must be no more than 64 characters. It may contain letters, numbers, spaces, periods, underscores, hyphens, and `@`. You may leave this field blank.

The maintainer information will be displayed in Settings -> System -> Software update.

### Manual changes

If uwuCLI don't work for you, please configure the following flags in the device tree's `device.mk` or an equivalent Makefile:

```
# Device type
# Select from phone, tablet, or foldable.
UWU_DEVICE_TYPE := phone

# Whether the device supports telephony
# Select from true or false.
UWU_SUPPORTS_TELEPHONY := true

# OPTIONAL: Device maintainer
UWU_MAINTAINER := Akaza_Akari
```

If you like, please open an issue on Issue Tracker for failed device tree.

## Optional (Phase 2)

> [!WARNING]
> Soong-only is not required to boot uwuAOSP.

> [!NOTE]
> For the benefits and limitations of Soong-only on your device, see [here](https://uwuaosp.uwuniverse.org/docs/soong-only/).

To migrate to Soong-only, uwuAOSP recommends the following changes:

### Migrate to uwu_prebuilt_image

At the end of Phase 1, uwuCLI will ask whether to write the Phase 1 changes. After they are written, uwuCLI will ask whether to convert the radio image integration method (if your device adds firmware images using `$(call add-radio-file,...)`).

This step is required if you want to enable Soong-only.

### Migrate to uwu_kernel

Follow the [uwu_kernel migration guide](https://uwuaosp.uwuniverse.org/docs/soong-only/uwu_kernel/migration.html).

For more details, see the [uwu_kernel documentation](https://uwuaosp.uwuniverse.org/docs/soong-only/uwu_kernel/).

### Check for packages blocking the migration to Soong-only

After running lunch, run:

```bash
uwu inspect soong-only
```

uwuCLI will take some time to check your device and all its dependencies. The time required depends on the device.

If the script reports the following result, you can switch to Soong-only:

```text
Conclusion
--------------------
  READY
  No selected package still depends on Android.mk.
```
