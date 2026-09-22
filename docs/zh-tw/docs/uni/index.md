# Uni 建置系統

Uni 是 uwuAOSP 的本機建置調度器。它仍使用 Soong、Kati 和 Ninja 產生並執行 Android 建置規則，但會在執行前保存建置圖狀態、拆分關鍵階段，並依即時資源為高記憶體工作分配獨立資源池。

```sh
source build/envsetup.sh
lunch uwu_nabu-cp2a-userdebug
uni -j18 otapackage
```

模組增量建置使用相同入口：

```sh
uni -j18 SystemUI Settings Launcher3QuickStep
```

## 工作原理

一次完整建置分為準備、啟動和最終 Ninja 階段：

1. **準備**：檢查產品、release、variant、目標參數、環境和建置系統指紋。指紋未變更時重用已保存的 Soong/Blueprint 建置圖；變更時才重新產生 Android.bp 圖。
2. **建立工作集**：從產品 Ninja 圖讀取可建置目標，結合歷史耗時、R8 目標和核心目標計算啟動順序。長工作會提前處理，R8 目標分散到批次中，避免最後集中排隊。
3. **啟動階段**：完整建置優先處理需要先完成的核心或歷史長工作。核心連結會與 Kotlin、Java、R8 等高記憶體工作分開，減少同時換頁。
4. **主要執行**：剩餘目標交給 Ninja 執行。全域 `-j` 仍由使用者指定，Java、Kotlin、Rust、R8 和其他高記憶體工作透過環境變數使用各自的准入池。
5. **最終階段**：驗證建置圖沒有在過程中變更，再執行封裝、分發和 OTA 目標。每個階段完成後寫入狀態，下一次建置可以重用已完成的輸出。
6. **復原**：發生中斷或持續記憶體壓力時，保留狀態和現有輸出。復原執行會重新讀取磁碟狀態，不會刪除可重用產物；只有確認出現壓力後才會降低自動資源池。

Uni 不會取代相依性檢查，也不會隱藏真實的原始碼變更。它只減少重複準備和不必要的等待。

## 相較 Make 的改進

原生 `make`/`m` 將整個 Ninja 圖交給單一全域並行限制。Uni 在此基礎上增加：

- **建置圖重用**：記錄產品、版本、變體、目標參數、圖檔案狀態和建置原始碼指紋，在條件不變時跳過重複準備。
- **關鍵路徑提前**：依歷史工作耗時優先處理長工作，並將 R8 目標分散到多個階段，減少尾端集中等待。
- **核心階段隔離**：完整建置先執行必要的巢狀核心目標，避免核心連結和 R8、Kotlin 同時爭用記憶體。
- **獨立資源池**：R8、Java、Kotlin、Rust 和其他高記憶體工作分別計算並行數，Ninja 全域 `-j` 不會被改寫。
- **Rust 並行限制**：同時考慮 `rustc` 數量和每個程序的 codegen units，避免 LLVM 後端讓一個 Ninja 工作再次放大成過多執行緒。
- **分段復原**：階段完成後保存 Ninja 復原狀態。受到壓力中止後，已完成輸出仍可重用。
- **可觀測性**：記錄 ccache 命中，並追蹤磁碟空間、記憶體、swap、PSI、CPU、程序峰值和資源池決策。
- **終端介面**：顯示 Graph、Kernel、Startup、Main、R8 和記憶體狀態，支援詳細資訊、複製模式和完整中斷。

## 資源計算公式

Uni 使用 `/proc/meminfo` 的 `MemTotal` 和 `MemAvailable`。以下數值均以 GiB 計算：

```text
T = MemTotal
A = MemAvailable
R = max(4, 0.25 × T)
H = min(6, max(4, 0.20 × T))
```

`R` 是保留給 Soong 非 Go 配置、系統和檔案快取的記憶體，`H` 是選擇 Android.bp 分析堆上限 `G` 時保留的活動程序空間：

```text
L = T - R
若 A > H：G = min(L, max(A / 2, A - H))
若 A ≤ H：G = A / 2
若結果 ≤ 0：G = max(1, T / 2)
```

`G` 不是單一 `soong_build` 程序的硬性 RSS 上限。C/C++、檔案映射和工具鏈程序也會使用記憶體，因此必須保留非 Go 記憶體空間。

### 工作資源池

對每一種工作，`B` 是並行准入預算，`J` 是使用者的全域 Ninja 限制：

```text
P = max(1, min(J, floor((A - 3 GiB) / B)))
```

| 工作 | `B` |
| --- | ---: |
| Java | 2 GiB |
| Rust | 2 GiB |
| 其他高記憶體工作 | 4 GiB |
| R8 | 5 GiB |
| Kotlin | 5 GiB |

Rust 還會限制 LLVM codegen units。若 `C` 是 codegen units，Rust 池不會超過：

```text
min(PRust, ceil(J / C))
```

明確設定 `NINJA_HIGHMEM_NUM_JOBS`、`NINJA_UNI_R8_NUM_JOBS`、`NINJA_UNI_RUST_NUM_JOBS`、`NINJA_UNI_JAVA_NUM_JOBS` 或 `NINJA_UNI_KOTLIN_NUM_JOBS` 時，對應資源池會使用使用者提供的值。沒有設定時，每個階段都會重新讀取 `MemAvailable` 計算，不會為所有電腦寫死同一組並行數。

## 建置圖與增量復原

正常重用要求以下內容保持相容：

- 產品、release、variant 和目標參數
- Android.bp、Blueprint、Make、Soong、Blueprint 和產品設定指紋
- 已產生的 Ninja 圖及其輸入檔案狀態
- 建置器版本和相關環境變數

原始碼或建置規則變更時，Uni 會重新準備受影響的圖。只有在確認磁碟輸出與目前原始碼相符時，才使用復原參數：

| 參數 | 行為 |
| --- | --- |
| `--trust-output` | 跳過復原輸出的新鮮度驗證 |
| `--assume-existing` | 接受 Ninja 記錄遺失但磁碟存在的輸出，並啟用 `--trust-output` |
| `--force-reuse` | 跳過原始碼新鮮度檢查，強制重用保存的圖 |

這些參數不會改變相依性關係。產品、分支或建置規則變更後，應使用普通增量建置讓 Uni 更新建置圖。

## 常用指令

```sh
# 檢視調度，不執行 Ninja
uni --plan -j18 otapackage

# 本次重新產生完整 R8 索引
uni --dev -j18 otapackage

# 持續啟用 R8 索引自動更新
uni --dev-auto -j18 otapackage

# 清理 Uni/Soong 建置記錄，不刪除建置輸出
uni --clean-logs

# 本次停用詳細除錯報告
uni --no-debug -j18 SystemUI
```

## Uni 執行時遙測

<UniBuildCharts locale="zh" />

圖表依 telemetry 欄位繪製 CPU、`MemAvailable`、累計 `swap-out` 和 `iowait`。橫軸是最終建置階段的經過時間。

## 輸出與疑難排解

建置完成時，Uni 會輸出一份摘要，包括階段數、最低可用記憶體、swap-out、套件或輸出目錄和總耗時。記錄會寫入 `OUT_DIR`：

```text
uwuCli-output_<timestamp>.log
uwuCli-debug-report_<timestamp>.log
```

失敗時先讀取記錄中的第一個真實編譯錯誤。最後的 `FAILED: ninja` 或 `signal: killed` 只說明最終狀態，不能單獨用來確定根因。
