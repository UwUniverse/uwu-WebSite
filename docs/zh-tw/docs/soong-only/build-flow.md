# Soong-only 建置流程

## 處理階段

一次一般的 Soong-only 產品建置可以分成以下階段：

```text
產品設定 Makefile
        |
        v
runMakeProductConfig
        |
        +--> soong_config.mk 匯出 JSON 產品變數
        |
        v
soong_ui 選擇 Soong-only
        |
        v
soong_build 分析 Android.bp 與生成的模組
        |
        +--> uwu_kernel 生成 kernel、DTB、DTBO、headers、modules
        |
        +--> fsgen 生成 filesystem、boot、super、vbmeta 模組
        |
        v
Ninja 執行建置動作
        |
        v
android_device 將映像與安裝檔案複製到 PRODUCT_OUT
```

## 略過 Kati 的位置

產品設定完成後，Soong-only 會略過 Kati 的兩個主要階段：

- `skipKati`：不執行 Kati 生成一般 Make 建置目標；
- `skipKatiNinja`：不使用 Kati 生成的 Ninja 檔案作為主要建置輸入。

`soong_ui` 仍會執行產品設定，因為 Soong 需要從產品 Makefile 取得裝置、分割區、AVB
與產品套件變數。略過的是目標生成，而不是產品變數讀取。

這樣可以避免每次建置都重新分析與轉換 Android.mk。依照 Soong 說明，Soong-only
的目標是將建置分析時間降低至約一半並提升開發效率。實際編譯時間仍取決於 Ninja
相依圖、原始碼變更、快取命中率與主機資源。

## 產品設定階段

`build/soong/ui/build/build.go` 仍會先呼叫產品設定。產品設定階段會解析：

- `PRODUCT_SOONG_ONLY`；
- `PRODUCT_PACKAGES` 與 `PRODUCT_COPY_FILES`；
- `BoardConfig.mk` 中的分割區、AVB、boot 與 kernel 變數；
- `SOONG_CONFIG_*` 命名空間變數。

因此 Soong-only 產品仍必須保持產品 Makefile 可解析。Soong-only 主要取代的是 Make
生成建置目標的階段，而不是產品設定語言本身。

## 模式選擇

`build/soong/ui/build/config.go` 處理三種入口：

| 入口 | 作用 |
| --- | --- |
| `PRODUCT_SOONG_ONLY := true` | 產品預設使用 Soong-only |
| `SOONG_ONLY=true` | 透過環境變數要求 Soong-only |
| `--soong-only` | 目前建置要求使用 Soong-only |

Soong-only 模式會設定 `skipKati` 與 `skipKatiNinja`。產品設定已讀取的 Make 變數
仍會用於生成 Soong 設定與決定目標裝置。

## Make 與 Soong 的設定橋接

`build/make/core/soong_config.mk` 會將 BoardConfig 與產品變數寫入 Soong 產品變數
JSON。與映像及核心相關的內容主要包括：

- `PartitionQualifiedVariables`：每個分割區的建置開關、檔案系統、大小與 AVB 參數；
- `BoardUsesSoongKernel`：是否使用 Soong 核心；
- `BoardAvbMakeVbmetaImageArgs`：vbmeta 的額外參數；
- `BoardKernelPagesize`：與 boot/DTBO 相關的 page size；
- `PartitionVarsForSoongMigrationOnlyDoNotUse`：遷移期間仍由 Make 提供的產品變數。

這些值會在 Soong 端透過 `android.Config().ProductVariables()` 讀取。裝置程式碼不應
直接讀取 `out/soong/.intermediates` 中的檔案來建立相依性。

## Soong 模組分析

`soong_build` 會分析所有相關的 `Android.bp`，接著由模組 load hook 建立衍生模組。
在 `build/soong/fsgen/filesystem_creator.go` 中，`filesystemCreator` 會：

1. 根據分割區變數建立 filesystem 模組；
2. 建立 boot、init_boot、vendor_boot 與 vendor_kernel_boot 模組；
3. 建立 DTBO、super 與 vbmeta 模組；
4. 建立 `android_device`，彙總映像與 target-files 相依性；
5. 在 Kati 未啟用時，建立傳統映像目標對應的 phony alias。

## 輸出階段

在 Soong-only 模式下，`android_device` 會將 filesystem 與映像複製到
`$(PRODUCT_OUT)`，並將主要裝置的 all-images stamp 接到 `droidcore-unbundled`。
如此 `m droid` 仍可建置產品所需的預設輸出。

映像 alias 例如：

```text
systemimage
bootimage
initbootimage
vendorbootimage
dtboimage
superimage
vbmetaimage
```

只有在對應模組與分割區實際存在時才會建立 alias。若沒有對應的分割區設定，
`vendorkernelbootimage` 等目標不能硬編碼到驗證腳本中。
