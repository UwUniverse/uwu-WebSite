---
title: uwuAOSP 17.0.100
description: uwuAOSP 17.0.100 release notes covering clipboard access, desktop settings, and Uni
aside: false
outline: false
---

<ReleaseBlog locale="en-US" mode="article" />

After months of porting and refinement, uwuAOSP 17.0.100 is ready to build and explore. Based on AOSP `android-17.0.0_r1`, it brings back familiar features from 16.2 and adds new choices. This update begins with something easy to overlook: which apps can access your clipboard.

## Clipboard access {#privacy-and-control}

After you copy some text, which apps may read it? Should an app ask before replacing it? [Clipboard access controls](/en/docs/ClipboardAccess/) manage reading and writing separately. Each app can be set to ask, allow, or deny. The prompt identifies the app and its request. A decision becomes a saved rule only when you select “Remember this action.”

<figure class="uwu-release-media">
  <img src="/images/uwu-17.0.100/clipboard.png" alt="Chrome asking to write to the clipboard, with Deny, Allow, and Remember this action controls" loading="lazy" />
  <figcaption>The prompt shown before an app writes to the clipboard. Reading and writing have separate decisions.</figcaption>
</figure>

Manual copy and paste still use Android's existing path. [App sensor access](/en/docs/AppSensorPolicy/) and [app jump controls](/en/docs/appjumpinjection/) offer more per-app choices. [Background management](/en/docs/uwuBackGroundManager/) lets you choose what happens after an app leaves the foreground.

## Desktop and appearance {#daily-use}

The home screen's [at-a-glance area](/en/docs/LauncherAtAGlance/) can show the date, weather, alarms, timers, and currently playing music. Quickstep also offers grid, icon, and search settings. Its icon page lets you choose a home-screen icon pack. Some launcher features were inspired by or ported from Lawnchair; thank you to its community.

<figure class="uwu-release-media">
  <img src="/images/uwu-17.0.100/launcher-settings.png" alt="Quickstep general settings" loading="lazy" />
  <img src="/images/uwu-17.0.100/launcher-icons.png" alt="Icon pack option in Quickstep icon settings" loading="lazy" />
  <figcaption>Quickstep's home-screen settings and icon-pack option.</figcaption>
</figure>

[Custom fonts](/en/docs/CustomFonts/) can import a single file or let you choose from a ZIP archive. Preview Chinese, English, numbers, and Japanese before applying a font. Restoring the default also clears imported font files.

<figure class="uwu-release-media">
  <img src="/images/uwu-17.0.100/fonts.png" alt="CookieRun font preview with Chinese, English, numbers, and Japanese on a tablet" loading="lazy" />
  <figcaption>Preview a font before applying it across the system.</figcaption>
</figure>

[System icons](/en/docs/SystemIcons/) can switch between the default style and PUI. The PUI assets originate from 天伞桜 and are now built from source as system overlays.

<figure class="uwu-release-media">
  <img src="/images/uwu-17.0.100/pui-quick-settings.png" alt="Quick Settings with PUI icons" loading="lazy" />
  <img src="/images/uwu-17.0.100/pui-about-device.png" alt="About device page with PUI styling" loading="lazy" />
  <figcaption>PUI in Quick Settings and system pages.</figcaption>
</figure>

With USB-C, HDMI, or a supported virtual display, [External desktop](/en/docs/ExternalDesktop/) uses Android's desktop mode to run apps in windows on the connected screen. You can choose whether to cover the built-in display and whether a scrcpy virtual display triggers desktop mode. [Status bar lyrics](/en/docs/StatusBarLyric/), [Smart Suggestions](/en/docs/SmartSuggestions/), and [per-app volume](/en/docs/PerAppVolume/) also return to the everyday experience.

## Builds and maintenance {#for-maintainers}

[Uni](/en/docs/uni/), developed by RinnRei, continues to use Soong, Kati, and Ninja while reducing time spent reanalyzing the build graph. It schedules kernel and main build work in stages, adjusts memory-intensive concurrency to available RAM, and retains reusable outputs after an interruption. Its logs record phases and resource changes to help diagnose failures.

In two clean-build records from this test machine, Make took 5h 19m 04s and Uni took 3h 43m 04s. That is 1h 36m less elapsed time, or about 30.1%. The host has an Intel Core Ultra 5 125H, 14 cores and 18 threads, and 32 GB of RAM; Uni ran with `-j18`. These are separate builds, so source state and system load may affect the comparison.

<div class="uwu-build-compare" role="group" aria-label="Clean build time comparison">
  <div><span>Make · clean build</span><strong>5:19:04</strong></div>
  <div><span>Uni · clean build</span><strong>3:43:04</strong></div>
</div>

The chart below comes from a different successful Uni build. It shows CPU, available RAM, swap-out, and I/O wait during its final phase. It is not a second-by-second trace of the two clean builds above.

<UniBuildCharts locale="en" />

The [Uni guide](/en/docs/uni/) covers commands, formulas, log fields, and test conditions. Work on the [Soong-only build flow](/en/docs/soong-only/) and [uwu_kernel](/en/docs/soong-only/uwu_kernel/) continues, giving maintainers a path toward device-tree migration and incremental kernel builds. A device tree can also name its maintainer on the software-updates page.

## Thanks and contributions {#thanks-and-contributing}

Thank you to AOSP, LineageOS, Lawnchair, and all the upstream projects and contributors. Thank you to everyone who provides test devices, reports issues, and improves translations. The source and documentation are public. You can share reproduction steps on the [issue page](/en/issues/website/) or contribute through [GitHub](https://github.com/uwuAOSP).

<p class="uwu-release-signature">The UwUniverse team<br />September 25, 2026 · Autumn</p>
