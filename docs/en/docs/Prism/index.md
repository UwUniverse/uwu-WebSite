# Prism

Prism captures the current screen so you can select text or images for recognition, copying, and export.

## Enable

Go to **uwuSettingsExt → Intelligence → Prism** and enable “Swipe up with three fingers”. The switch is off by default.

## Capture the screen

With the device unlocked and the screen on, place three fingers almost at the same time and swipe clearly upward. After the gesture is recognized, SystemUI captures the complete default display and opens the Prism capture page.

The gesture must be quick, continuous, and mostly vertical. A fourth finger, a finger lifted too early, insufficient travel, or two triggers that are too close together cancels the operation.

## Select content

On the capture page, create, move, resize, or delete two types of regions on the screenshot:

- **Text region**: run OCR, copy recognized text, or export TXT/PDF.
- **Image region**: save to Pictures, or export an image/PDF.

The local model depends on uwuAICore and a downloaded model. Prism can also use its built-in Chinese and English Tesseract models. Tesseract may still work when AI Core is unavailable.

## Save files

Screen captures and OCR crops use temporary files by default and are cleaned up after a normal exit. Content is written permanently to storage only when the user explicitly chooses Save or Export; triggering the gesture does not automatically save a screenshot to the gallery.

## Scope

- Nothing is captured while the device is locked, the screen is off, or the system is non-interactive, and the gesture is not replayed after unlocking.
- Only the default display is captured; multiple-display selection is not available.
- A successful gesture takes over the current touch sequence, so the foreground app may receive one gesture-cancel event.
- If Prism fails to start, the temporary screenshot for this attempt is deleted.
