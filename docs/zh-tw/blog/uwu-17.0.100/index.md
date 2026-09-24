---
title: uwuAOSP 17.0.100
description: 更自由的桌面與外觀設定、細緻的應用程式控制，以及讓裝置維護者少等一會的建置工具
aside: false
outline: false
---

<ReleaseBlog locale="zh-TW" mode="article" />

經過數月的移植與打磨，uwuAOSP 17.0.100 已進入可以建置和體驗的階段。它基於 AOSP `android-17.0.0_r1`，帶回許多 16.2 使用者熟悉的功能，也增加新的選擇。這次更新從一個容易忽略的操作談起：應用程式存取剪貼簿。

## 剪貼簿權限 {#privacy-and-control}

複製文字後，哪些應用程式可以讀取？應用程式寫入剪貼簿時，是否應先詢問？[應用程式剪貼簿權限](/zh-tw/docs/ClipboardAccess/)現在將讀取與寫入分開管理。每個應用程式都可設為詢問、允許或不允許。詢問視窗會說明應用程式與請求；只有勾選「記住本次操作」，決定才會儲存為規則。

<figure class="uwu-release-media">
  <img src="/images/uwu-17.0.100/clipboard.png" alt="Chrome 要求寫入剪貼簿的權限視窗，包含不允許、允許和記住本次操作" loading="lazy" />
  <figcaption>應用程式寫入剪貼簿前的詢問視窗。讀取與寫入分別決定。</figcaption>
</figure>

手動複製、貼上仍沿用系統原有的操作路徑。[應用程式感測器存取](/zh-tw/docs/AppSensorPolicy/)與[應用程式跳轉控制](/zh-tw/docs/appjumpinjection/)提供更多個別管理選項。[背景管理](/zh-tw/docs/uwuBackGroundManager/)則用來選擇應用程式離開前景後的運作方式。

## 桌面與外觀 {#daily-use}

主畫面的[一覽區域](/zh-tw/docs/LauncherAtAGlance/)可以顯示日期、天氣、鬧鐘、計時器與正在播放的音樂。Quickstep 也提供網格、圖示和搜尋設定；圖示頁面支援選擇桌面圖示包。部分桌面功能借鑑或移植自 Lawnchair，感謝 Lawnchair 社群。

<figure class="uwu-release-media">
  <img src="/images/uwu-17.0.100/launcher-settings.png" alt="Quickstep 的一般設定頁面" loading="lazy" />
  <img src="/images/uwu-17.0.100/launcher-icons.png" alt="Quickstep 圖示設定中的圖示包選項" loading="lazy" />
  <figcaption>Quickstep 的桌面設定與圖示包選項。</figcaption>
</figure>

[自訂字型](/zh-tw/docs/CustomFonts/)可以匯入單個字型，也可以從 ZIP 壓縮檔挑選。套用前可預覽中文、英文、數字與日文。還原預設字型時，已匯入的字型檔會清除。

<figure class="uwu-release-media">
  <img src="/images/uwu-17.0.100/fonts.png" alt="在平板上預覽 CookieRun 字型的中文、英文、數字與日文效果" loading="lazy" />
  <figcaption>選擇字型後先預覽，再套用至系統。</figcaption>
</figure>

[系統小圖示](/zh-tw/docs/SystemIcons/)可在預設與 PUI 兩種風格間切換。PUI 資源來自天伞桜的作品，現已整理成隨系統原始碼建置的覆蓋層。

<figure class="uwu-release-media">
  <img src="/images/uwu-17.0.100/pui-quick-settings.png" alt="採用 PUI 圖示的控制中心" loading="lazy" />
  <img src="/images/uwu-17.0.100/pui-about-device.png" alt="採用 PUI 風格的關於本機頁面" loading="lazy" />
  <figcaption>PUI 在控制中心與系統頁面的實際效果。</figcaption>
</figure>

連接 USB-C、HDMI 或受支援的虛擬顯示器時，[外接螢幕桌面](/zh-tw/docs/ExternalDesktop/)可使用 Android 桌面模式，讓應用程式在外接螢幕上以視窗執行。本機螢幕是否遮蓋、scrcpy 虛擬螢幕是否觸發桌面模式，都可單獨設定。[狀態列歌詞](/zh-tw/docs/StatusBarLyric/)、[智慧建議](/zh-tw/docs/SmartSuggestions/)和[個別應用程式音量](/zh-tw/docs/PerAppVolume/)也回到日常體驗。

## 建置與維護 {#for-maintainers}

RinnRei 開發的 [Uni](/zh-tw/docs/uni/)沿用 Soong、Kati 與 Ninja，並減少重複分析建置圖的等待。它依階段安排核心與主要編譯工作，根據可用記憶體調整高記憶體任務的並行數，中斷後保留可重用的產物。日誌記錄各階段與資源變化，方便找出失敗原因。

在這台測試機的兩次 clean build 記錄中，Make 用時 5 小時 19 分 04 秒，Uni 用時 3 小時 43 分 04 秒。相差 1 小時 36 分鐘，Uni 的總用時減少約 30.1%。測試機使用 Intel Core Ultra 5 125H、14 核 18 執行緒、32 GB 記憶體；Uni 使用 `-j18`。兩次記錄來自不同建置過程，原始碼狀態與系統負載可能造成誤差。

<div class="uwu-build-compare" role="group" aria-label="Clean build 用時比較">
  <div><span>Make · clean build</span><strong>5:19:04</strong></div>
  <div><span>Uni · clean build</span><strong>3:43:04</strong></div>
</div>

下圖取自另一場成功建置的 Uni 日誌，顯示最後階段的 CPU、可用記憶體、swap-out 與 I/O wait 變化。這張圖說明工具如何記錄建置過程，不代表上面兩次 clean build 的逐秒曲線。

<UniBuildCharts locale="zh-tw" />

[Uni 文件](/zh-tw/docs/uni/)提供命令、計算公式、日誌欄位與測試條件。[Soong-only 建置流程](/zh-tw/docs/soong-only/)與 [uwu_kernel](/zh-tw/docs/soong-only/uwu_kernel/)仍在推進，為裝置樹遷移與核心增量編譯提供路徑。維護者也可在裝置樹填寫姓名，讓軟體更新頁面顯示維護資訊。

## 感謝與參與 {#thanks-and-contributing}

感謝 AOSP、LineageOS、Lawnchair，以及所有上游專案與貢獻者。感謝提供測試裝置、回報問題與完善翻譯的社群成員。原始碼與文件都公開；發現問題時，可在[議題頁面](/zh-tw/issues/website/)附上重現過程，或透過 [GitHub](https://github.com/uwuAOSP) 提交修改。

<p class="uwu-release-signature">UwUniverse全體成員<br />2026.9.25 秋</p>
