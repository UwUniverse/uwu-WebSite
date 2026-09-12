# uwuBackGroundManager

uwuBackGroundManager 是一個依應用程式管理背景策略的系統功能，可凍結閒置應用程式或提升應用程式在背景存活的能力。

## 裝置執行需求

- 核心支援 cgroup freezer。
- Android-Binder 驅動支援程序凍結。
- Android 使用者空間 freezer 已啟用，且可以存取 freezer cgroup 階層。

## 運作原理

應用程式模式依使用者儲存在 `Settings.Secure` 中。設定在應用程式重新啟動與裝置重新啟動後仍會保留。`system_server` 監聽設定變更，並將模式套用至該應用程式 UID 下的全部程序。

控制器會追蹤應用程式可見狀態、音訊播放、錄音、定位監聽、VPN 連線與 Binder 活動。這些狀態會暫時阻止應用程式被凍結。保護狀態結束後，墓碑模式會重新安排凍結。

墓碑模式會在應用程式閒置約 3 秒後凍結符合條件的程序。音訊停止後會等待約 6 秒。程序存在可見 Activity、前景服務、正在接收廣播、正在執行服務、Instrumentation、明確 CPU 能力或 AOSP freezer 豁免時，不會被凍結。

被凍結的墓碑應用程式收到 Binder 請求時，uwuBackGroundManager 會暫時解凍整個應用程式 UID，不會走 AOSP 預設的凍結程序終止邏輯。Binder 閒置約 3 秒後，該 UID 可以再次被凍結。

Full 模式不使用 freezer。它會將程序的 OOM 調整值限制在「可感知應用程式」級別，並把應用程式套件名稱與 app ID 加入 Device Idle 允許清單。這樣可以減少程序回收與 Doze 限制，但不能保證應用程式永遠不會被終止。

選用的「忽略啟動器工作卡片移除」只對墓碑或 Full 模式的應用程式生效。從最近工作劃掉應用程式時，啟動器清單中的工作卡片會消失，但工作、頁面狀態與程序會保留。強制停止、應用程式崩潰、嚴重記憶體壓力或應用程式主動退出仍會結束程序。

## 核心端所需支援

### 墓碑模式必要項目

- `CONFIG_CGROUP_FREEZER=y`  
  提供暫停與恢復應用程式程序所需的 cgroup freezer。目前使用的 cgroup 階層必須向 Android 使用者空間提供可寫入的 `cgroup.freeze` 介面。

- `CONFIG_ANDROID_BINDER_IPC=y`  
  提供應用程式程序與系統程序使用的 Android Binder IPC 驅動程式。

- `BINDER_FREEZE`  
  Binder UAPI 與驅動程式必須實作此 ioctl。Android 透過它凍結目標程序的 Binder 傳遞，使 Binder 狀態與 cgroup 凍結狀態保持一致。

- `BINDER_GET_FROZEN_INFO`  
  Binder UAPI 與驅動程式必須實作此 ioctl，並回報程序凍結期間收到的同步與非同步交易。framework 依賴這些狀態，在出現 Binder 活動時安全解凍墓碑應用程式。

- Binder 凍結交易追蹤  
  驅動程式必須追蹤凍結期間待處理的同步交易與非同步流量。只在標頭檔中定義 ioctl 編號並不足夠，還需要對應的驅動程式實作。

- 使用者空間與核心 Binder 介面一致  
  核心中的 ioctl 結構與指令編號必須與呼叫它們的 Android 使用者空間相符。

Full 模式不需要專用核心 hook。

### 墓碑模式

保留記憶體狀態，但閒置時不繼續佔用 CPU。

- 保護延遲結束後凍結符合條件的背景程序。
- 程序存活期間保留記憶體與應用程式狀態。
- 音訊、錄音、定位、VPN、可見狀態與 Binder 活動會暫時喚醒或保護應用程式。
- 記憶體壓力較高時，應用程式仍可能被系統回收。
- 前景程序或明確豁免的程序可能不會被凍結。

> Tip：離開聊天應用程式後，符合條件的程序會被凍結。收到 Binder 事件時，應用程式會暫時解凍並處理事件，閒置後再次凍結。

### Full

適合需要持續執行背景工作的應用程式。

- uwuBackGroundManager 不會凍結該應用程式。
- 程序 OOM 優先級至少提高至「可感知應用程式」級別。
- 應用程式加入 Device Idle 允許清單，減少 Doze 限制。
- 在其他 Android 權限與限制允許的範圍內，應用程式可以繼續執行背景工作。
- 應用程式仍可能主動退出、崩潰、被強制停止，或在嚴重記憶體壓力下被終止。

> Tip：下載器可以繼續執行背景工作，並獲得比預設模式更強的程序保留能力。

### 預設

預設模式會移除該應用程式的 uwuBackGroundManager 策略，恢復 Android 原生程序管理。

### 致謝

非常感謝 Cirno 專案對本功能的啟發：https://github.com/Freezer-Team/Cirno.git
