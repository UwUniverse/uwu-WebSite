# 除錯指令

開發者可以透過 `adb shell wm moment` 查看或控制 Moment。

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

- `enable` / `disable`：暫時啟用或停用 Moment。
- `status`：顯示開關、預設比例與活動工作數量。
- `list`：列出目前的 Moment 工作。
- `start`：以 Moment 啟動指定 Activity。
- `convert`：轉換指定工作；省略工作 ID 時轉換目前聚焦的工作。
- `stop` / `fullscreen`：將指定 Moment 恢復至全螢幕。
- `close-all`：將所有 Moment 恢復至全螢幕。
- `set-scale`：設定除錯用的預設縮放比例。

這些指令面向開發與除錯，不取代使用者設定頁面。部分指令的狀態不會作為持久使用者設定儲存。
