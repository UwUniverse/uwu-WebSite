---
title: uwuAOSP 17.0.100
description: 更自由的桌面與外觀設定、更細緻的應用程式控制，以及給裝置維護者的新工具
aside: false
outline: false
---

<ReleaseBlog locale="zh-TW" mode="article" />

經過數月的移植與打磨，uwuAOSP 17.0.100 已進入可以建置和體驗的階段。它基於 AOSP `android-17.0.0_r1`，帶回許多 16.2 使用者熟悉的功能，也加入新的選擇。以下整理日常使用中看得到的變化，以及裝置維護者會用到的工具。

## 日常使用 {#daily-use}

主畫面有更完整的[一覽區域](/zh-tw/docs/LauncherAtAGlance/)：日期、天氣、鬧鐘、計時器與正在播放的音樂可以出現在同一處。需要其他配置時，Launcher 也提供網格、圖示與搜尋設定。部分桌面功能借鑑或移植自 Lawnchair；感謝 Lawnchair 社群的工作。

外觀設定也更靈活。[自訂字型](/zh-tw/docs/CustomFonts/)可以匯入單個字型，或從 ZIP 中挑選字型，先預覽中文、英文、數字與日文，再決定是否套用到系統。還原預設字型時，已匯入的檔案也會清除。[系統小圖示](/zh-tw/docs/SystemIcons/)提供預設與 PUI 兩種風格。PUI 資源來自天伞桜的作品，現已整理為隨系統原始碼建置的覆蓋層。

連接 USB-C、HDMI 或受支援的虛擬顯示器時，[外接螢幕桌面](/zh-tw/docs/ExternalDesktop/)可以使用 Android 桌面模式，讓應用程式在外接螢幕上以視窗執行。是否遮蓋本機螢幕，以及是否允許 scrcpy 建立的虛擬螢幕進入桌面模式，都由使用者決定。實際表現仍取決於裝置的影像輸出能力與應用程式的多視窗支援。

一些熟悉的細節也回來了：[智慧建議](/zh-tw/docs/SmartSuggestions/)會依情境提供操作，[狀態列歌詞](/zh-tw/docs/StatusBarLyric/)讓正在播放的內容更容易看到。[個別應用程式音量](/zh-tw/docs/PerAppVolume/)則能在多個應用程式同時發聲時分別調整音量。

## 隱私與控制 {#privacy-and-control}

[應用程式剪貼簿權限](/zh-tw/docs/ClipboardAccess/)提供分開設定讀取與寫入的規則。使用者可以選擇允許、詢問或拒絕；詢問視窗也允許只處理目前的請求，不必每次都儲存永久規則。系統原有的輸入法與受信任情境豁免仍然保留。

[應用程式感測器存取](/zh-tw/docs/AppSensorPolicy/)、[應用程式跳轉控制](/zh-tw/docs/appjumpinjection/)及[背景管理](/zh-tw/docs/uwuBackGroundManager/)提供更多選擇。各項功能的適用範圍與限制，都寫在對應文件中。

## 給裝置維護者 {#for-maintainers}

RinnRei 開發的 [Uni 建置工具](/zh-tw/docs/uni/)沿用 Soong、Kati 與 Ninja，重點在於減少重複分析建置圖的時間，並將核心、耗時任務與主要建置安排在不同階段。它會依可用記憶體調整高記憶體任務的並行數，建置中斷後保留可重用的產物，也提供詳細日誌供排查。建置時間取決於原始碼變更、裝置設定和主機硬體；文件列有測試資料與計算方式。

我們也在推進 [Soong-only 建置流程](/zh-tw/docs/soong-only/)與 [uwu_kernel](/zh-tw/docs/soong-only/uwu_kernel/)，為裝置樹遷移和核心增量建置提供路徑。目前仍有相依項目需要手動處理；維護者可依文件逐項驗證。vendor 設定經過整理，裝置維護者也可以在裝置樹中填寫姓名，讓軟體更新頁面顯示維護資訊。

## 感謝與參與 {#thanks-and-contributing}

感謝 AOSP、LineageOS、Lawnchair，以及所有上游專案與貢獻者。也感謝測試裝置、回報問題與完善翻譯的社群成員。uwuAOSP 的原始碼與文件都公開；如果發現問題，歡迎在 [議題頁面](/zh-tw/issues/website/)記錄重現方式，或透過 [GitHub](https://github.com/uwuAOSP) 提交修改。
