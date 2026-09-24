---
title: uwuAOSP 17.0.100
description: A more flexible home screen, more control over apps, and better tools for device maintainers
aside: false
outline: false
---

<ReleaseBlog locale="en-US" mode="article" />

After months of porting and refinement, uwuAOSP 17.0.100 is ready to build and explore. It is based on AOSP `android-17.0.0_r1`. Many familiar features from 16.2 return, alongside new ways to make the system your own. Here are the changes you can see in daily use and the tools available to device maintainers.

## Everyday experience {#daily-use}

The home screen now has a richer [at-a-glance area](/en/docs/LauncherAtAGlance/) for the date, weather, alarms, timers, and currently playing music. Launcher also offers grid, icon, and search settings for people who want a different layout. Some of this work was inspired by or ported from Lawnchair. Thank you to the Lawnchair community.

Appearance is more flexible, too. [Custom fonts](/en/docs/CustomFonts/) can import a font file or let you choose one from a ZIP archive. You can preview Chinese, English, numbers, and Japanese before applying it across the system. Restoring the default font also clears imported files. [System icons](/en/docs/SystemIcons/) offer a choice between the default look and PUI. The PUI assets originate from 天伞桜 and are built from source as system overlays.

With USB-C, HDMI, or a supported virtual display, [External desktop](/en/docs/ExternalDesktop/) uses Android's desktop mode to run apps in windows on the connected screen. You can choose whether to cover the built-in display and whether a new scrcpy virtual display may enter desktop mode. The result still depends on the device's video output and each app's multi-window support.

Some familiar touches are back: [Smart Suggestions](/en/docs/SmartSuggestions/) offer contextual actions, [status bar lyrics](/en/docs/StatusBarLyric/) keep music close at hand, and [per-app volume](/en/docs/PerAppVolume/) lets you adjust apps separately when several are playing audio.

## Privacy and control {#privacy-and-control}

[Clipboard access controls](/en/docs/ClipboardAccess/) provide separate rules for reading and writing the clipboard. You can allow, ask, or deny access for each app. A prompt can apply to one request without creating a permanent rule. Android's existing exemptions for input methods and trusted system paths remain in place.

[App sensor access](/en/docs/AppSensorPolicy/), [app jump controls](/en/docs/appjumpinjection/), and [background management](/en/docs/uwuBackGroundManager/) offer further choices about what apps may do. Their individual guides explain where each control applies and where Android's own behavior still takes precedence.

## For device maintainers {#for-maintainers}

[Uni](/en/docs/uni/), developed by RinnRei, continues to use Soong, Kati, and Ninja. It aims to avoid repeated build-graph analysis and schedules kernel work, long-running tasks, and the main build in distinct stages. It adjusts memory-intensive concurrency to available memory, keeps reusable outputs after an interruption, and records detailed diagnostic logs. Build times vary with source changes, device configuration, and host hardware; the guide includes measurements and the resource formulas.

Work on the [Soong-only build flow](/en/docs/soong-only/) and [uwu_kernel](/en/docs/soong-only/uwu_kernel/) gives maintainers a path toward device-tree migration and incremental kernel builds. Some dependencies still need manual handling. The vendor configuration has also been reorganized, and a device tree can now set a maintainer name for the software-updates page.

## Thanks and contributions {#thanks-and-contributing}

Thank you to AOSP, LineageOS, Lawnchair, and the other upstream projects and contributors. We are also grateful to everyone who tests devices, reports issues, and improves translations. The source and documentation are open. If something breaks, please share reproduction steps on the [issue page](/en/issues/website/) or send a change through [GitHub](https://github.com/uwuAOSP).
