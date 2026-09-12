# Debug commands

Developers can inspect or control Moment with `adb shell wm moment`.

```text
adb shell wm moment enable
adb shell wm moment disable
adb shell wm moment status
adb shell wm moment list
adb shell wm moment start [--user USER_ID] PACKAGE/CLASS
adb shell wm moment convert [TASK_ID]
adb shell wm moment stop TASK_ID
adb shell wm moment fullscreen TASK_ID
adb shell wm moment close-all
adb shell wm moment set-scale SCALE
```

- `enable` / `disable`: temporarily enable or disable Moment.
- `status`: show the switch state, default scale, and active task count.
- `list`: list current Moment tasks.
- `start`: start the specified Activity as a Moment.
- `convert`: convert the specified task; without a task ID, convert the currently focused task.
- `stop` / `fullscreen`: restore the specified Moment to fullscreen.
- `close-all`: restore every Moment to fullscreen.
- `set-scale`: set the default scale used for debugging.

These commands are for development and debugging and do not replace the user settings
page. Some command state is not saved as persistent user configuration.
