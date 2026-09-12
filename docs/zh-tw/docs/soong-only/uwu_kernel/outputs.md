# uwu_kernel 輸出與相依性

## 輸出標籤

`uwu_kernel` 透過 Soong 輸出標籤暴露產物：

| 標籤 | 輸出 | 主要使用者 |
| --- | --- | --- |
| 預設標籤 `""` | 核心映像 | fsgen bootimg、android_device |
| `.config` | 最終 Kconfig 檔案 | 除錯與設定驗證 |
| `.dtb` | DTB 映像 | boot 映像、裝置驗證 |
| `.dtbo` | DTBO 映像 | fsgen DTBO、vbmeta |
| `.modules` | 核心 modules zip | 分割區模組安裝器 |

原始碼核心會依啟用的屬性生成 `.config`、headers、DTB、DTBO 與 modules。prebuilt
核心不執行 Kbuild；只有在設定 `prebuilt_config`、`prebuilt_headers`、`dtb.src`、
`dtbo.src` 或 `prebuilt_modules` 時，才會提供對應輸出。

裝置設定應透過模組引用標籤，例如：

```text
:kernel
:kernel{.dtb}
:kernel{.dtbo}
:kernel{.modules}
```

不要將 `out/soong/.intermediates` 中的具體路徑寫入 Android.bp 或 Makefile。

## Kernel action

原始碼建置會建立獨立的 `kernel_build` 輸出目錄，並建立以下相依關係：

1. 建立核心原始碼與外部模組的目錄相依性 stamp；
2. 從設定輸入生成 `.config`，並由原始碼輸入執行 `headers_install` 與 UAPI headers 清理；
3. 讓核心映像 action 依賴 `.config` 與原始碼相依性 stamp；
4. 讓 DTB/DTBO action 依賴核心映像、DTS 輸出與原始碼相依性 stamp；
5. 讓 modules action 依賴核心/DT 輸出，編譯、安裝並打包核心 modules。

每個 action 都將前一階段輸出列為明確相依性，因此 DT、modules 與 headers 不會脫離
核心映像的建置圖單獨漂移。

如果啟用了 `autofdo_profile`，profile 也會作為核心、DT 與 modules action 的明確輸入。
啟用 `rbe_wrapper` 時，wrapper 腳本同樣是 action 輸入。

## 工具鏈

預設 Kbuild 呼叫使用 tree 內的工具：

- Clang：`prebuilts/clang/host/linux-x86/<version>/bin`；
- build tools：`prebuilts/build-tools/linux-x86/bin`；
- kernel tools：`prebuilts/kernel-build-tools/linux-x86/bin`；
- Lineage 工具：`prebuilts/tools-lineage/linux-x86/bin`；
- Perl 基礎模組：`prebuilts/tools-lineage/common/perl-base`。

呼叫中會明確設定 `LLVM=1`、`LLVM_IAS=1`、`DTC_EXT`、`LZ4`、`LEX`、`YACC`、`M4`、
`PAHOLE`、`LIBCLANG_PATH`、`CC` 與 `LD`。這可避免核心建置依賴主機發行版中恰好
安裝的工具版本。

## 原始碼相依性

`source_deps/source.d` 由 Soong 目錄相依規則生成。核心原始碼與設定檔作為 action
輸入，原始碼目錄作為目錄相依性；因此新增或修改核心檔案時可以觸發對應 action，
同時避免把整個原始碼樹展開到每條 Ninja 規則。

`srcs` 只用於目錄相依性之外的額外檔案。不要使用：

```bp
srcs: ["**/*"],
```

這種寫法會增加 Soong 分析記憶體、Ninja 檔案大小與重新分析成本。

## UAPI headers

`uwu_kernel` 執行 Kbuild `headers_install`，接著執行
`vendor/uwu/build/tools/clean_headers.sh`。共用的 `generated_kernel_includes` 模組
會轉發 `SOONG_KERNEL_MODULE` 指向的 headers；尚未遷移的裝置則回退至
`generated_kernel_includes_legacy`。

預編譯核心可以透過 `prebuilt_headers` 使用相同的 headers provider；壓縮包必須是
gzip 壓縮的 tar archive。

原生模組繼續依賴 `generated_kernel_includes`，不需要改用特定裝置的中間目錄。

## Modules zip 與分割區安裝器

`.modules` 輸出是一個包含安裝結果、load list 與 blocklist 的 zip。`uwu_kernel` 會
根據四類分割區的清單生成內部 `PrebuiltKernelModules` 模組，fsgen 再將這些模組接入
對應的 filesystem 或 ramdisk。

這些內部模組不是供裝置產品設定直接加入的公共產品模組。裝置只需要在
`uwu_kernel.modules` 宣告清單，並透過 `PRODUCT_PACKAGES += kernel` 安裝主模組。

## 中間輸出

裝置建置的主要核心中間目錄通常是：

```text
out/soong/.intermediates/device/<vendor>/<device>/kernel/<variant>/
```

其中可能包含 `kernel/<image_name>`、`kernel_build/.config`、`dtb/<image_name>`、
`dtbo/<image_name>`、`headers/` 與 `source_deps/source.d`。裝置端應將這些作為驗證
線索，而不是穩定 API。
