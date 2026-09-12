# 從 Make 核心建置遷移至 uwu_kernel

## 遷移原則

舊版 `vendor/uwu/build/tasks/kernel.mk` 使用全域變數、隱式 Make 規則與多個共用的中間
目錄。`uwu_kernel` 將 Android 端的編排改為宣告式模組，但底層 Kconfig、Kbuild、DTS
與模組編譯仍由核心原始碼執行。

遷移不是將變數名稱機械式替換成小寫屬性。應先確認舊變數實際控制的是：

- 核心原始碼與工具鏈；
- Kconfig 輸入；
- DTB/DTBO 輸出；
- 核心 modules 的建置或安裝；
- Android boot/分割區映像。

## 設定位置轉換

| 舊版 Make 設定 | `uwu_kernel` 設定 | 說明 |
| --- | --- | --- |
| `TARGET_KERNEL_SOURCE` | `kernel_dir` | 相對於 Android 根目錄的原始碼目錄 |
| `KERNEL_ARCH` / `TARGET_KERNEL_ARCH` | `kernel_arch` | Kbuild 架構 |
| `BOARD_KERNEL_IMAGE_NAME` | `image_name` | `arch/<arch>/boot` 下的輸出檔名 |
| `TARGET_PREBUILT_KERNEL` | `prebuilt` | 使用預編譯核心，略過原始碼建置 |
| 預編譯核心 config | `prebuilt_config` | 提供 `.config` 輸出 |
| 預編譯核心 headers archive | `prebuilt_headers` | 提供 UAPI headers provider |
| 預編譯核心 modules zip | `prebuilt_modules` | 提供 `.modules` 輸出與分割區 installer |
| `TARGET_KERNEL_CONFIG` 第一個項目 | `config.defconfig` | 基礎 defconfig |
| `TARGET_KERNEL_CONFIG` 其餘項目 | `config.fragments` | 依序合併的 fragment |
| `TARGET_KERNEL_CONFIG_EXT` | `config.fragments` | 遷移為原始碼樹中的明確設定路徑 |
| `KERNEL_CONFIG_OVERRIDE` | `config.overrides` | 最後附加的設定行 |
| `MERGE_ALL_KERNEL_CONFIGS_AT_ONCE` | `config.merge_at_once` | 一次性或逐一合併 fragment |
| `KERNEL_LTO` | `config.lto` | `none`、`thin` 或 `full` |
| `TARGET_KERNEL_CLANG_VERSION` | `clang_version` | tree 內的 Clang 版本 |
| `TARGET_KERNEL_CLANG_PATH` | `clang_path` | 自訂 Clang 路徑 |
| `KERNEL_CLANG_TRIPLE` | `clang_triple` | 覆寫目標 triple |
| `KERNEL_CROSS_COMPILE` | `cross_compile` | 交叉工具鏈前綴 |
| `KERNEL_CC` | `cc`、`ld` 或 `make_flags` | 舊值若同時包含 `CC=` 與 `LD=`，應拆分後再填入 |
| `KERNEL_MAKE_CMD` | `make_command` | Kbuild 使用的 make |
| `KERNEL_MAKE_FLAGS` | `make_flags` | 傳給每次 Kbuild 呼叫 |
| `TARGET_KERNEL_ADDITIONAL_FLAGS` | `additional_flags` | 裝置額外的 Kbuild flags |
| `CLANG_AUTOFDO_PROFILE` | `autofdo_profile` | AutoFDO profile，預設可使用 GKI profile |
| 核心 rewrapper 設定 | `rbe_wrapper` | 只包裝實際編譯動作 |
| `TARGET_KERNEL_MIXED_MODE` | 裝置與分割區設定 | 不再作為 kernel action 的全域開關 |

`TARGET_KERNEL_VERSION` 通常不屬於核心編譯參數。QCOM 平台與 HAL 選擇邏輯可能仍會
使用它，遷移時應保留並依平台需求設定。

## DTB/DTBO 轉換

| 舊版 Make 設定 | `uwu_kernel` 設定 |
| --- | --- |
| `BOARD_DTB_CFG` | `dtb.config` |
| `BOARD_DTBO_CFG` | `dtbo.config` |
| `BOARD_KERNEL_SEPARATED_DTBO` | `dtbo.enabled` 與裝置 DT 設定 |
| `TARGET_MERGE_DTBS_WILDCARD` | `dtb.input_globs` |
| `TARGET_DTB_LIST_WILDCARD` | `dtb.input_globs` |
| `TARGET_MERGE_DTBOS_WILDCARD` | `dtbo.input_globs` |
| `TARGET_DTBO_LIST_WILDCARD` | `dtbo.input_globs` |
| `BOARD_CUSTOM_DTBIMG_MK` | `dtb.custom_command` 或通用 Soong 能力 |
| `BOARD_CUSTOM_DTBOIMG_MK` | `dtbo.custom_command` 或通用 Soong 能力 |
| QCOM merge dtbs 腳本 | `dtb.qcom_merge: true`，同時啟用 DTB/DTBO |
| `BOARD_KERNEL_PAGESIZE` | Android boot/DTBO 分割區相關設定；DTBO 使用 `page_size` |

舊 Make 變數有時只表達「是否進入某個規則」，新屬性還需要表達實際輸入、輸出與 target。
轉換時應檢查生成的指令與映像內容，而不是只檢查屬性是否存在。

## Modules 轉換

舊系統將模組建置、安裝分割區與載入清單分散在多個變數中。新系統集中至 `modules`：

| 舊版 Make 設定 | `modules` 屬性 |
| --- | --- |
| `BOARD_KERNEL_MODULES` / kernel `modules` target | `build_targets` |
| `TARGET_KERNEL_EXT_MODULE_ROOT` | `external_module_root` |
| 外部模組清單 | `external_modules` |
| `*_KERNEL_MODULES_LOAD` | 對應的 `*_module_load_list` |
| `*_KERNEL_MODULES` 或 include 清單 | 對應的 `*_module_install_list` |
| `BOARD_*_KERNEL_MODULES_BLOCKLIST` | 對應的 `*_module_blocklist` |
| `TARGET_AUTO_COLLECT_KERNEL_MODULE_DEPS` | `auto_collect_deps` |
| `BOARD_KERNEL_MODULES_LOAD_ALLOW_MISSING` | `allow_missing_load` |
| 模組檔案重新命名規則 | `module_aliases` |
| `NEED_KERNEL_MODULE_ROOT` | 依實際分割區重新宣告，不直接遷移 |
| `NEED_KERNEL_MODULE_SYSTEM` | `system_dlkm` 或實際 system 安裝屬性 |
| `NEED_KERNEL_MODULE_VENDOR_OVERLAY` | 重新建模為對應 filesystem 相依性 |

`install_list` 與 `load_list` 必須同時存在，且 load list 中的模組必須出現在 install list。
清單可以使用路徑，Soong 會依模組 basename 驗證並生成結果。

## 裝置轉換範例

遷移時，在裝置的 `BoardConfig.mk` 與 `device.mk` 中接入 Soong 核心：

```make
# BoardConfig.mk
BOARD_USES_SOONG_KERNEL := true
SOONG_KERNEL_MODULE := //device/<vendor>/<device>:kernel

# device.mk
ifeq ($(BOARD_USES_SOONG_KERNEL),true)
PRODUCT_PACKAGES += kernel
endif
```

對應的 Android.bp 以宣告式方式提供核心、DTB、DTBO、modules、config 與工具鏈：

```bp
uwu_kernel {
    name: "kernel",
    kernel_dir: "kernel/<vendor>/<kernel>",
    kernel_arch: "arm64",
    image_name: "Image",
    clang_version: "clang-r<version>",
    additional_flags: [
        "CONFIG_DEVICE_DTB=y",
    ],
    config: {
        defconfig: "gki_defconfig",
        fragments: [
            "vendor/common.config",
            "vendor/device.config",
        ],
    },
    dtb: {
        enabled: true,
        qcom_merge: true,
        target: "dtbs",
        image_name: "dtb.img",
    },
    dtbo: {
        enabled: true,
        target: "dtbs",
        image_name: "dtbo.img",
        page_size: 4096,
    },
}
```

## 無法直接轉換的設定

以下舊設定需要人工判斷，不能簡單替換：

- `TARGET_KERNEL_PLATFORM_TARGET`：這是外部 kernel platform/Kleaf 編排，不等價於 `kernel_dir`；
- 舊 Make 的 RBE 全域變數不會自動遷移，應在模組中明確設定 `rbe_wrapper`；
- 自訂 DTB/DTBO Makefile：應優先補充通用 `uwu_kernel` 能力；
- `NEED_KERNEL_MODULE_*`：它們同時改變 Android 安裝路徑與分割區相依性；
- 外部模組的獨立 Makefile：需要決定使用一般 external module 還是 `:kbuild`；
- 透過 `$(shell)` 生成設定或清單：必須改成 Soong action 的明確輸入輸出；
- 依賴 `KERNEL_OUT`、`DTB_OUT` 或 `DTBO_OUT` 具體路徑的腳本：應改用模組標籤。

遷移完成後，刪除已由 `uwu_kernel` 接管的舊核心編譯變數，但保留 Android 平台、boot
image、HAL namespace 或分割區設定仍需要的變數。

## 驗證

遷移提交至少應驗證：

1. 核心預設輸出與 `boot.img` 生成；
2. `.config` 包含基礎設定、fragment、override 與 LTO 結果；
3. DTB/DTBO 的輸入、合併方式、page size 與最終映像正確；
4. 核心 headers 能被 `generated_kernel_includes` 使用；
5. modules 的建置、安裝集合、load list 與 blocklist 正確；
6. 原始碼、UAPI header、設定與清單修改能觸發對應的增量 action；
7. Soong-only 與 Soong+Make 的 target-files 或映像差異可以解釋。
