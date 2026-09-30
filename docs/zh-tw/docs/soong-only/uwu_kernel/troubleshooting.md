# uwu_kernel 疑難排解

## 修改核心原始碼後沒有重新編譯

首先確認修改的檔案位於 `kernel_dir` 中。如果修改的是 external module，請確認它位於 `external_module_root` 中。

`uwu_kernel` 會追蹤這些目錄中的原始碼變更。只有位於這些目錄之外、但仍需要作為核心建置輸入的檔案，才應透過 `srcs` 明確宣告。

請勿使用：

```bp
srcs: ["**/*"],
```

將整個原始碼樹展開為 Soong 輸入，會大幅增加 Soong 分析與建置圖生成的負擔。若原始碼相依性沒有正確追蹤，請先檢查 `kernel_dir`、`external_module_root` 和實際原始碼位置。

## External module 建置失敗

首先確認 `external_module_root` 和 `external_modules` 指向正確位置。

一般 external module 會透過自己的 Makefile 建置。如果模組需要使用主要核心 Kbuild 的 `M=` 模式，請使用 `:kbuild` 後綴：

```bp
external_modules: [
    "vendor/example:kbuild",
],
```

如果模組可以編譯但無法正確安裝，也請檢查生成的 `.ko` 是否位於 `uwu_kernel` 能收集的模組輸出中。

## Kernel module 未安裝到預期分割區

請檢查該模組是否列在對應分割區的 install list 中。`uwu_kernel` 支援 `system_dlkm`、`vendor_dlkm`、`vendor_ramdisk` 和 `recovery`。

Install list 決定模組是否安裝到該分割區；load list 則決定要載入哪些已安裝模組。請勿為了安裝模組而將它加入 load list。

啟用 `auto_collect_deps` 時，會根據 install list 自動補上相依模組；未啟用時，請確認所需相依項目已包含在安裝集合中。

## Kernel module 未載入

首先確認模組已安裝到預期分割區，再檢查它是否列在該分割區的 load list 中。

`uwu_kernel` 要求：

```text
load list ⊆ install list
```

如果 load list 包含未安裝到對應分割區的模組，建置會失敗。

如果模組已正確安裝並列於 load list，但裝置開機後仍未載入，請繼續檢查生成的 `modules.load`、模組相依性、blocklist 和裝置開機記錄。此時問題通常已不是 `uwu_kernel` 的模組配置本身。

## DTB 或 DTBO 建置失敗

確認已啟用對應輸出，並檢查 `target`、`input_globs` 與實際 Kbuild 輸出是否一致。

使用 `qcom_merge` 時，`dtb.enabled` 和 `dtbo.enabled` 必須同時啟用。此模式會使用 `dtb.target` 建置裝置樹，再根據生成的 DTS 輸出完成 DTB/DTBO 合併。

若裝置採用非標準的裝置樹配置，請先確認能否透過 `target` 或 `input_globs` 描述；只有標準流程無法處理時才使用 `custom_command`。

## Kernel configuration 與預期不符

請檢查最終生成的 `.config`，不要只檢查來源 defconfig、fragment 或 `overrides`。

Kconfig 在合併 fragment、套用 LTO 設定和附加 override 後，還會處理預設值；最終 `.config` 才是實際用於核心建置的設定。
