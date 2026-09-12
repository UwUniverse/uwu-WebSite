# Moment

Moment is uwuAOSP's lightweight multitasking window. It turns app tasks into movable,
resizable windows and provides several ways to launch and restore them quickly.

## How It Works

Moment uses an independent window mode in Android WindowManager. The app continues to run
in its original Android task. The system presents that task as a Moment by transforming the
task Surface through scaling, cropping, rounded corners, and position changes, rather than
simulating a floating layer inside the app.

The Moment controller in `system_server` handles window state, animation, position
constraints, scaling, compact mode, and fullscreen transitions. SystemUI provides the
navigation bar, notification, and MomentArc entry points. Launcher handles the Recents
gesture, and uwuSettingsExt provides the master switch, entry settings, and app-selection
pages.

Moment settings are stored per user in `Settings.Secure`. Turning off the master switch
stops new Moment launches and restores that user's existing Moments to fullscreen. Work
profiles and other users have independent settings and task state.

The app still draws its own content. Moment preserves the Activity stack, back behavior,
and page state within the same task, and keeps rounded corners for predictive back
animations across Activities. In landscape, the system uses a smaller default scale based
on available space and constrains the window to avoid system bars and control areas.

## Features

- [Launch apps](./launching-apps.md): start an app directly as a Moment from Moment settings or the app list.
- [Double-tap navigation bar](./navigation-handle.md): convert the current app to a Moment or open the Moment app list from the home screen.
- [MomentArc](./moment-arc.md): quickly select an app or shortcut from a bottom screen corner.
- [Open notifications](./notifications.md): open a notification in Moment while keeping a fullscreen button.
- [Swipe up in Recents](./recents-gesture.md): continue swiping up to open the current task as a Moment.
- [Multiple windows and focus](./multiple-windows.md): keep multiple Moments and switch between apps.
- [Move and resize](./move-and-resize.md): drag a window and resize it from the corners.
- [Controls menu](./controls.md): switch to fullscreen, close, or enter compact mode.
- [Compact mode](./compact-mode.md): shrink, dock, hide, or fling a Moment closed.
- [Landscape support](./landscape.md): use dimensions and layout suited to landscape space.
- [Back action](./back.md): use the bottom control bar to go back with predictive back animation support.
- [Settings and scope](./settings.md): master switch, entry switches, orientation options, and device scope.
- [Debug commands](./debugging.md): inspect and control Moment with `wm moment`.

## Scope

Moment is primarily intended for quick multitasking on phones. uwuSettingsExt currently
does not show Moment settings on tablet devices.

Some apps depend on fixed dimensions, a specific orientation, fullscreen system UI,
protected content, or vendor window behavior and may not provide a complete experience in
Moment. Cameras, games, screen casting, installers, authentication, and emergency actions
are generally better suited to fullscreen use.

Moment does not bypass Android lock screens, work-profile authentication, Activity launch
permissions, or app-specific restrictions.
