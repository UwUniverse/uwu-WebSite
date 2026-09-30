# uwuBackGroundManager

uwuBackGroundManager 依應用程式管理背景行為。它可以凍結閒置應用程式，或提高需要持續工作的應用程式之背景保留等級。

## 應用程式模式

- **預設**：不套用 uwuAOSP 策略，使用 Android 原生背景管理。
- **墓碑模式**：應用程式閒置後凍結程序，保留記憶體狀態並停止 CPU 執行。
- **Full**：不凍結應用程式，將 OOM 優先級限制在「可感知應用程式」級別，並加入 Device Idle 允許清單。

策略依使用者和套件儲存在 `Settings.Secure`。`system_server` 會監聽設定變更，並將模式套用至相同 UID 下的程序。

墓碑模式會追蹤可見 Activity、前景服務、廣播、執行中的服務、Instrumentation、音訊播放與錄製、定位、VPN、Binder 活動和 AOSP freezer 豁免。保護狀態結束後，符合條件的應用程式會重新進入凍結佇列。收到 Binder 請求時，系統會先解凍整個 UID；請求處理完成且應用程式再次閒置後再凍結，而不是依 AOSP 預設路徑終止凍結中的程序。

Full 模式會減少程序回收和 Doze 限制，但不能保證應用程式永久存活。強制停止、崩潰、主動退出和嚴重記憶體壓力仍可能結束程序。

## Freezer 後端

設定頁提供自動、CGroup1、CGroup2 和混合後端。系統會讀取 cgroup 掛載配置與 freezer 能力：

- **自動**會依裝置實際配置選擇可用後端。
- 目前核心不支援的手動選項會停用。
- 手動選擇失效或配置變更時，framework 會回退至可用後端；若沒有可用 freezer，就不會執行墓碑凍結。

墓碑模式也要求 Binder 驅動支援 `BINDER_FREEZE`、`BINDER_GET_FROZEN_INFO` 和凍結交易追蹤。只定義 ioctl 編號而沒有驅動實作並不足夠。Full 模式不需要這些凍結介面。

## 最近工作

「忽略啟動器工作卡片移除」只適用於墓碑和 Full 模式的應用程式。從最近工作清除卡片後，卡片會消失，但工作與程序可以繼續保留。強制停止仍會結束應用程式。

## 診斷記錄

設定頁可以匯出背景管理記錄。記錄使用 `[INFO]`、`[WARN]` 和 `[ERROR]` 標示，包含建置資訊、應用程式策略、要求及實際使用的 freezer 後端、cgroup 控制器與掛載、Binder 節點、核心 freezer 狀態及 framework 事件。匯出只會讀取本機狀態，不會上傳檔案。

## 核心需求

- CGroup1 需要可寫入的 freezer controller。
- CGroup2 需要可寫入的 `cgroup.freeze`。
- Android Binder 驅動需要提供與使用者空間相容的凍結 UAPI。
- Android 使用者空間 freezer 必須啟用，且可存取對應的 cgroup 階層。

此功能受到 [Cirno](https://github.com/Freezer-Team/Cirno.git) 啟發。
