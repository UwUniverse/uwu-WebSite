# Moment

Moment 是 uwuAOSP 的輕量多工視窗。它可以將應用程式工作轉換為可移動、可縮放的小窗，並提供多種快速啟動與恢復方式。

## 運作方式

Moment 在 Android WindowManager 中使用獨立的視窗模式。應用程式仍在原本的 Android 工作中執行，系統透過工作 Surface 的縮放、裁切、圓角與位置變換，將工作顯示為 Moment，而不是在應用程式內部模擬一層浮動介面。

`system_server` 中的 Moment 控制器負責視窗狀態、動畫、位置限制、縮放、摺疊模式與全螢幕轉換。SystemUI 負責導覽列、通知與 MomentArc 等入口，Launcher 負責最近工作手勢，uwuSettingsExt 提供總開關、入口設定與應用程式選擇頁面。

Moment 設定依使用者儲存在 `Settings.Secure` 中。關閉總開關會停止新的 Moment 啟動，並將該使用者已有的 Moment 恢復為全螢幕。工作設定檔等其他使用者擁有獨立的設定與工作狀態。

應用程式內容仍由應用程式自身繪製。Moment 會保留同一工作內的 Activity 堆疊、返回行為與頁面狀態，並為跨 Activity 的預測式返回動畫保留小窗圓角。橫向螢幕時，系統會根據可用空間使用較小的預設比例，並限制視窗避免遮擋系統列與操作區域。

## 功能

- [啟動應用程式](./launching-apps.md)：從 Moment 設定或應用程式清單直接啟動小窗。
- [導覽列雙擊](./navigation-handle.md)：將目前應用程式轉換為 Moment，或從主畫面開啟 Moment 應用程式清單。
- [MomentArc](./moment-arc.md)：從螢幕底角快速選擇應用程式或捷徑。
- [開啟通知](./notifications.md)：在 Moment 中開啟通知，並保留全螢幕開啟按鈕。
- [最近工作上滑手勢](./recents-gesture.md)：繼續上滑，將目前工作以 Moment 開啟。
- [多視窗與焦點](./multiple-windows.md)：同時保留多個 Moment，並在應用程式之間切換。
- [移動與縮放](./move-and-resize.md)：拖曳視窗並從四角調整大小。
- [操作選單](./controls.md)：全螢幕、關閉與進入摺疊模式。
- [摺疊模式](./compact-mode.md)：縮小、吸附邊緣、隱藏或拖曳關閉 Moment。
- [橫向螢幕適配](./landscape.md)：在橫向螢幕使用適合可用空間的尺寸與配置。
- [返回操作](./back.md)：使用底部操作列返回，並支援預測式返回動畫。
- [設定與適用範圍](./settings.md)：總開關、入口開關、方向選項與裝置範圍。
- [除錯指令](./debugging.md)：透過 `wm moment` 查看與控制 Moment。

## 適用範圍

Moment 主要面向手機上的快速多工。uwuSettingsExt 目前不會在平板裝置上顯示 Moment 設定入口。

部分應用程式依賴固定尺寸、特定螢幕方向、全螢幕系統 UI、受保護內容或廠商視窗行為，可能無法在 Moment 中獲得完整體驗。相機、遊戲、投影、安裝器、身分驗證與緊急操作等情境通常更適合全螢幕使用。

Moment 不會繞過 Android 的鎖定螢幕、工作設定檔驗證、Activity 啟動權限或應用程式本身的限制。
