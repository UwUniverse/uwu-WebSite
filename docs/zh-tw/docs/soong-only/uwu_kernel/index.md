# uwu_kernel

`uwu_kernel` 是 uwuAOSP 用於將核心建置整合至 Soong 的模組類型，目的是取代舊有的核心建置工作。

`uwu_kernel` 不會取代核心本身的建置系統。實際的核心建置仍由 Kbuild、Bazel 等系統負責；`uwu_kernel` 則將建置流程及其輸出整合至 Android 建置系統。

## 為什麼需要 uwu_kernel

舊有的核心建置工作是一般裝置轉用 Soong-only 的主要阻礙。切換至 Soong-only 可以大幅縮短建置圖生成時間。

舊有的核心模組設定將模組安裝位置和載入清單分散在多個 Make 變數與檔案中，彼此還有交叉引用。因此，很難直接從設定確認：

- 模組最後會安裝到哪個分割區；
- 模組為什麼會被安裝；
- 哪些模組會在開機時實際載入。

`uwu_kernel` 不保留這些隱含行為。裝置應直接宣告所需的核心設定、輸出和模組配置，讓最終狀態能從裝置設定中直接確認。

## 遷移

建議使用 uwuCLI 進行初次遷移。它會讀取現有裝置設定，並生成對應的 `uwu_kernel` 設定。

對於核心模組，uwuCLI 會解析舊有模組設定及其引用的靜態模組清單，並據此生成對應的安裝清單與載入清單設定。如果現有設定無法可靠轉換，uwuCLI 會回報阻礙項目，而不是猜測裝置所需的模組配置。

請檢查自動轉換的結果。

詳細步驟請參閱[從舊有核心建置遷移](migration.md)。

## 文件

- [遷移指南](migration.md)：將現有裝置遷移至 `uwu_kernel`
- [設定參考](configuration.md)：`uwu_kernel` 支援的設定項目
- [輸出](outputs.md)：其他 Soong 模組可使用的核心輸出
- [疑難排解](troubleshooting.md)：常見建置與設定問題

## 已驗證裝置

`uwu_kernel` 已在以下具代表性的核心設定上完成建置與開機驗證：

| 裝置 | Kernel | 類型 | 核心建置系統 |
| --- | --- | --- | --- |
| OnePlus 6T (`fajita`) | 4.19 | non-GKI | Kbuild |
| OnePlus Ace 3 / 12R (`aston(c)`) | 5.15 | GKI | Kbuild |
| POCO F7 / Redmi Turbo 4 Pro (`onyx`) | 6.6 | GKI | Bazel |
