# uwu_kernel 建置系統

`uwu_kernel` 是 uwuAOSP 提供的 Soong 模組類型。它不取代 Linux Kbuild，而是將
Android 端的核心編排從全域 Make 變數與隱式規則轉換為 Soong 模組相依性。

## 為什麼需要 uwu_kernel

Soong-only 的核心是略過 Kati 的 Android 目標生成階段。如果核心仍只透過舊版
`vendor/uwu/build/tasks/kernel.mk` 建置，核心映像、DTB、DTBO、modules 與 UAPI
headers 的輸入輸出關係仍停留在 Make 的隱式規則中，Soong 與 fsgen 就無法可靠地將
這些產物納入自己的相依圖。

`uwu_kernel` 將 Android 端的核心建置宣告為 Soong 模組，使 Soong 可以看見：

- 核心原始碼、設定與工具鏈輸入；
- 核心映像、DTB、DTBO、modules 與 UAPI headers 輸出；
- 外部模組、安裝清單與分割區之間的相依性。

因此 fsgen 可以直接使用模組輸出並生成 boot、DTBO、super 與 vbmeta 映像，而不需要
再次依賴 Kati 生成的核心目標。這樣才能在略過 Kati 後維持完整的 Android 建置相依關係。

原始碼建置仍由 Soong action 呼叫 Linux Kbuild；`prebuilt` 模式不會呼叫 Kbuild。
若預編譯模式仍需要提供設定、headers 或 modules 輸出，必須同時宣告對應的
`prebuilt_config`、`prebuilt_headers` 與 `prebuilt_modules` 屬性。

Soong 官方說明指出，Soong-only 的目標是將建置分析時間降低至約一半並提升開發效率。
`uwu_kernel` 參與的是實現此目標所需的核心遷移：略過 Android 端的 legacy Make
編排，但仍由 Soong action 呼叫 Linux Kbuild 完成實際核心編譯。

## 頁面導覽

| 頁面 | 內容 |
| --- | --- |
| [設定參考](configuration.md) | 常用 `uwu_kernel` 屬性與裝置範例 |
| [輸出與相依性](outputs.md) | 核心、DT、modules、headers 輸出及使用者 |
| [Make 遷移](migration.md) | 將舊版 Make 設定轉換為 `uwu_kernel` |
| [疑難排解](troubleshooting.md) | 設定、相依性、工具鏈與增量建置問題 |

## 職責邊界

| 層 | 職責 |
| --- | --- |
| `uwu_kernel` | 宣告輸入輸出、準備工具鏈、呼叫 Kbuild、匯出 headers 與映像 |
| Linux Kbuild | 執行 Kconfig、編譯核心、生成 DT 與模組 |
| `fsgen` | 使用核心輸出並建立 Android boot、DTBO、super、vbmeta 映像 |
| 裝置樹 | 選擇原始碼、defconfig、fragment、DT 策略與模組安裝清單 |
| 核心樹 | 維護原始碼、Kbuild、DTS、defconfig 與 UAPI |

遷移不要求也不應該將核心原始碼中的 Makefile 改寫成 Android.bp。Soong 只負責
Android 建置圖中的呼叫與相依性宣告。

## 最小設定

```bp
uwu_kernel {
    name: "kernel",
    kernel_dir: "kernel/vendor/device",
    kernel_arch: "arm64",
    image_name: "Image",
    clang_version: "clang-r<version>",
    config: {
        defconfig: "gki_defconfig",
        fragments: ["vendor/device.config"],
    },
}
```

未設定 `clang_version` 時，會繼承 envsetup 匯出的 AOSP Clang 版本。需要 AutoFDO 或
RBE 時分別設定 `autofdo_profile` 與 `rbe_wrapper`，兩者都只影響原始碼核心。

在 BoardConfig 階段選擇此模組：

```make
BOARD_USES_SOONG_KERNEL := true
SOONG_KERNEL_MODULE := //device/<vendor>/<device>:kernel
```

將它加入產品安裝集合：

```make
PRODUCT_PACKAGES += kernel
```

## 設計原則

- 裝置透過模組名稱與輸出標籤使用核心產物，不直接依賴 `.intermediates` 路徑；
- 通用建置邏輯放在 `vendor/uwu/build/soong/kernel`，裝置差異保留在 Android.bp；
- 核心原始碼由目錄相依性追蹤，不將整個原始碼樹展開為 `srcs`；
- 核心、DT、模組與 UAPI headers 都必須在 Soong 圖中具有明確相依性；
- legacy Make 路徑只作為尚未遷移裝置的相容路徑，不再新增裝置專屬例外。
