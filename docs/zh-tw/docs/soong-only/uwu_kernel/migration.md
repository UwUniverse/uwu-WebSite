# 從舊有核心建置遷移至 uwu_kernel

## 使用 uwuCLI

建議使用 uwuCLI 進行初次轉換：

```bash
uwu
```

請依提示選擇裝置和核心遷移。

uwuCLI 會讀取現有裝置設定，並盡可能轉換核心建置設定。生成的設定未必是最終結果。遷移完成後，請確認核心設定、DTB/DTBO 和核心模組符合裝置實際情況。

## Kernel

舊有核心建置通常使用以下變數指定核心：

```make
TARGET_KERNEL_SOURCE := kernel/<vendor>/<kernel>
TARGET_KERNEL_ARCH := arm64
BOARD_KERNEL_IMAGE_NAME := Image
```

遷移後，請在 `uwu_kernel` 模組中直接宣告這些資訊：

```bp
uwu_kernel {
    name: "kernel",

    kernel_dir: "kernel/<vendor>/<kernel>",
    kernel_arch: "arm64",
    image_name: "Image",
}
```

只有裝置確實需要時才設定工具鏈、額外 Kbuild flags 和其他特殊設定。完整屬性請參閱[設定參考](configuration.md)。

## Kernel configuration

舊有核心建置可以透過 `TARGET_KERNEL_CONFIG`、`TARGET_KERNEL_ADDITIONAL_FLAGS` 等變數設定核心組態和額外建置旗標。例如：

```make
TARGET_KERNEL_CONFIG := \
    gki_defconfig \
    vendor/device.config

TARGET_KERNEL_ADDITIONAL_FLAGS := \
    CONFIG_EXAMPLE=y
```

遷移後，請直接表達相同的設定關係：

```bp
additional_flags: [
    "CONFIG_EXAMPLE=y",
],

config: {
    defconfig: "gki_defconfig",
    fragments: [
        "vendor/device.config",
    ],
},
```

## DTB 和 DTBO

一般裝置可以直接宣告對應輸出：

```bp
dtb: {
    enabled: true,
    target: "dtbs",
    image_name: "dtb.img",
},

dtbo: {
    enabled: true,
    target: "dtbs",
    image_name: "dtbo.img",
    page_size: 4096,
},
```

若要使用 Qualcomm DT merge，請在 `dtb` 中設定 `qcom_merge`。啟用後，`dtb.enabled` 和 `dtbo.enabled` 必須同時設為 `true`：

```bp
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
```

## Kernel modules

核心模組是遷移時最需要人工檢查的部分。

舊有核心建置將模組安裝位置與載入清單分散在多個 Make 變數和外部清單中，彼此還有交叉引用。例如裝置可能會使用：

```make
BOARD_SYSTEM_KERNEL_MODULES_LOAD
BOARD_VENDOR_KERNEL_MODULES_LOAD
BOARD_VENDOR_RAMDISK_KERNEL_MODULES_LOAD
BOOT_KERNEL_MODULES
SYSTEM_KERNEL_MODULES
```

`uwu_kernel` 不使用這些舊有變數。每個需要安裝核心模組的分割區，都必須分別指定：

1. install list：要安裝到該分割區的模組；
2. load list：要從該分割區載入的模組。

例如：

```bp
modules: {
    enabled: true,

    system_dlkm_module_install_list: [
        "modules.include.system_dlkm",
    ],
    system_dlkm_module_load_list: [
        "modules.load.system_dlkm",
    ],

    vendor_dlkm_module_install_list: [
        "modules.include.vendor_dlkm",
    ],
    vendor_dlkm_module_load_list: [
        "modules.load.vendor_dlkm",
    ],
},
```

Install list 說明**分割區包含什麼**；load list 說明**要載入什麼**。因此必須符合：

```text
load list ⊆ install list
```

`uwu_kernel` 會在建置時檢查此關係。如果 load list 中的模組未列於對應 install list，建置就會失敗。模組不會只因出現在 load list 中就自動安裝。

這是刻意的設計：最終模組配置應能直接從裝置設定確認，不必重新推導規則。

uwuCLI 會解析舊有核心模組設定及其引用的靜態模組清單，再生成對應的 install list 和 load list 設定。如果無法可靠轉換，uwuCLI 會回報問題。轉換完成後，仍請確認各分割區的清單符合裝置實際情況。

### 自動收集模組相依項目

Install list 不必手動列出所有模組相依項目。啟用 `auto_collect_deps` 後，`uwu_kernel` 會根據清單中的模組自動收集相依項目，並加入最終 install list：

```bp
modules: {
    enabled: true,
    auto_collect_deps: true,

    vendor_dlkm_module_install_list: [
        "modules.include.vendor_dlkm",
    ],
    vendor_dlkm_module_load_list: [
        "modules.load.vendor_dlkm",
    ],
},
```

`auto_collect_deps` 只會補上 install list 所需的模組相依項目，不會根據 load list 推斷要安裝哪些模組。裝置所需的 install list 和 load list 仍須明確指定。

### External modules

若裝置使用主核心樹之外的 external modules，請指定 external module root 和要建置的模組：

```bp
modules: {
    enabled: true,

    external_module_root: "kernel/<vendor>/<device>-modules",
    external_modules: [
        "vendor/example",
    ],
},
```

預設情況下，`uwu_kernel` 會使用 external module 自己的建置系統，並提供核心原始碼和輸出目錄等資訊。

若 external module 屬於主核心 Kbuild tree，且需要透過 Kbuild 的 `M=` 模式建置，請在模組路徑後加上 `:kbuild`：

```bp
modules: {
    enabled: true,

    external_module_root: "kernel/<vendor>/<device>-modules",
    external_modules: [
        "vendor/example:kbuild",
    ],
},
```

這等同於透過主核心建置系統執行 `M=<module> modules` 和對應的 `modules_install`。請勿只為保留舊有建置結構而複製額外 Make 規則。

模組屬性和支援的設定請參閱[設定參考](configuration.md)。

## 接入 Android 建置

定義 `uwu_kernel` 後，還需要設定 Android 建置使用此模組。

請在裝置設定中選擇 Soong kernel：

```make
BOARD_USES_SOONG_KERNEL := true
SOONG_KERNEL_MODULE := //device/<vendor>/<device>:kernel
```

並將核心加入產品：

```make
PRODUCT_PACKAGES += kernel
```

其他模組應透過 `uwu_kernel` 的公開輸出引用核心產物。請勿依賴 `out/soong/.intermediates` 中的特定路徑。

可用輸出請參閱[輸出](outputs.md)。

## 無法自動遷移的設定

部分舊有設定描述的不只是核心建置參數，因此無法安全地直接轉換。常見情況包括：

- 自訂 DTB/DTBO Makefile；
- 依賴特定 `KERNEL_OUT`、`DTB_OUT` 或 `DTBO_OUT` 路徑的腳本；
- 平台專用的核心建置 wrapper。

遇到這些設定時，請先確認預期結果，再以 `uwu_kernel` 表達該結果。

請勿為了逐行重現舊有 Make 實作，而在 Soong 中重新建立相同的隱含規則。

若多個裝置都需要 `uwu_kernel` 目前無法表達的功能，請在 Issue Tracker 提出 issue。

## 驗證

遷移後先執行一般建置：

```bash
uni
```

至少確認：

- kernel image 可以正常生成；
- 最終 `.config` 符合裝置預期；
- DTB/DTBO 可以生成，且裝置能正常開機；
- 核心模組安裝至正確分割區；
- 模組 load list 符合開機需求；
- 裝置可以正常開機並運作。

常見問題請參閱[疑難排解](troubleshooting.md)。
