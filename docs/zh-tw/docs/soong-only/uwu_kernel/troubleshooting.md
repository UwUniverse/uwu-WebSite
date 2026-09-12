# uwu_kernel 疑難排解

## 找不到核心模組

確認 `SOONG_KERNEL_MODULE` 在 BoardConfig 階段設定，且模組名稱與 Android.bp 一致：

```make
BOARD_USES_SOONG_KERNEL := true
SOONG_KERNEL_MODULE := //device/<vendor>/<device>:kernel
```

同時確認產品包含：

```make
PRODUCT_PACKAGES += kernel
```

不要只在產品 Makefile 後段設定 `SOONG_KERNEL_MODULE`。Soong mutator 與 fsgen 需要在
模組分析階段讀取它。

## 找不到設定檔

沒有斜線的設定名稱會依照以下路徑解析：

```text
<kernel_dir>/arch/<config_arch>/configs/<name>
```

包含路徑的設定名稱會以原始碼根目錄解析，例如 `vendor/common.config` 對應原始碼根目錄
下的檔案。`x86_64` 的 defconfig 目錄會轉換為 `arch/x86/configs`。

檢查 `config.defconfig` 與所有 fragment 是否存在，並確認 fragment 順序沒有依賴舊版
Make 的隱式變數展開。

如果使用 `prebuilt` 核心，原始碼設定屬性不會執行；應分別設定 `prebuilt_config`、
`prebuilt_headers` 與 `prebuilt_modules` 來提供對應輸出。

## 修改原始碼後沒有重新編譯

檢查：

1. 修改檔案是否位於 `kernel_dir` 或 `external_module_root`；
2. `source_deps/source.d` 是否包含對應目錄；
3. 是否手動修改了 `out/soong` 中間檔案；
4. 原始碼是否位於目錄相依性之外且沒有加入 `srcs`；
5. action 的輸出時間戳是否被外部腳本覆寫。

不要透過 `srcs: ["**/*"]` 解決問題。應修正原始碼根目錄或補充最小的額外輸入。

## Headers 沒有更新

確認 `generated_kernel_includes` 依賴的是目前的 `uwu_kernel`，而不是
`generated_kernel_includes_legacy`。接著檢查：

```text
out/soong/.intermediates/device/<vendor>/<device>/kernel/
  <variant>/headers.timestamp
out/soong/.intermediates/device/<vendor>/<device>/kernel/
  <variant>/source_deps/source.d
```

headers action 會執行 Kbuild `headers_install`，接著執行
`vendor/uwu/build/tools/clean_headers.sh`。如果 action 已執行但結果不完整，應檢查
核心的 UAPI 匯出規則，而不是手動複製 headers。

## DTB 或 DTBO 失敗

依序檢查：

- `dtb.enabled` 與 `dtbo.enabled` 是否符合 `qcom_merge` 的要求；
- Kbuild `target` 是否真的生成對應的 DT 檔案；
- `input_globs` 是否符合實際輸出；
- DTBO `page_size` 是否與 BoardConfig 及 bootloader 要求一致；
- `custom_command` 是否使用合法的 `$(kernelDir)`、`$(kernelOut)` 與 `$(out)`；
- 使用 QCOM 合併時，`merge_dtbs.py` 的輸入目錄是否包含基礎 DTB 與 techpack DT。

不要直接編輯生成的 `.dtb` 或 `.dtbo`。

## Modules 建置成功但沒有安裝

確認模組同時出現在對應的 install list 與 load list。還要檢查：

- 模組所屬分割區是否為 `system_dlkm`、`vendor_dlkm`、`vendor_ramdisk` 或 `recovery`；
- `external_module_root` 是否正確；
- 一般 external module 是否應改為 `path:kbuild`；
- `module_aliases` 是否使用 `old.ko:new.ko`；
- 是否需要啟用 `auto_collect_deps`；
- blocklist 是否錯誤使用模組 basename 以外的路徑。

不要將內部生成的 `kernel_modules_*` 模組手動加入 `PRODUCT_PACKAGES`。

## 工具鏈或 Perl 錯誤

檢查實際 action 是否使用 tree 內的工具鏈與工具路徑。常見問題包括：

- `clang_version` 不存在；
- 自訂 `clang_path` 缺少 `bin` 或 `lib`；
- `DTC_EXT` 使用了錯誤的 host 輸出；
- 外部模組依賴主機系統 Perl；
- `make_command` 指向的工具不支援目前的 Kbuild 參數。

優先修正模組屬性，不要在裝置 Makefile 中重新拼接另一套 PATH。

如果啟用 `rbe_wrapper`，確認它是完整的 rewrapper 指令，且建置環境設定了 `TOP`。
