# Soong-only 映像生成

## 元件職責

| 元件 | 主要職責 |
| --- | --- |
| `build/make/core/soong_config.mk` | 匯出分割區、boot 與 AVB 參數 |
| `build/soong/fsgen` | 根據產品變數建立映像模組與相依性 |
| `build/soong/filesystem` | 實作 filesystem、bootimg、DTBO、vbmeta 等模組 |
| `android_device` | 彙總裝置相依性並將結果複製到 `PRODUCT_OUT` |
| `ninja` | 依照 Soong 生成的規則執行實際指令 |

## Filesystem 分割區

fsgen 會從 `PartitionQualifiedVariables` 判斷需要生成哪些分割區。常見分割區包括
`system`、`system_ext`、`product`、`vendor`、`odm`、`userdata`、`system_dlkm`、
`vendor_dlkm`、`odm_dlkm` 與 `recovery`。

每個 filesystem 模組會先生成 staging directory，再根據分割區的檔案系統與 AVB 設定
生成映像。動態分割區產品也會把有效分割區交給 `super` 映像模組；vbmeta 模組則會
使用分割區模組提供的輸出與公開金鑰資訊。

## Boot 映像

fsgen 根據以下輸入建立 boot 類映像：

- `SOONG_KERNEL_MODULE` 指向的核心模組預設輸出；
- 核心模組的 `.dtb` 輸出；
- `ramdisk`、`vendor_ramdisk` 或 recovery filesystem；
- boot header version、分割區大小、kernel cmdline 與 bootconfig；
- 對應分割區的 AVB key、algorithm、rollback index 與 security patch。

`android_device` 接著將模組輸出複製為：

```text
$(PRODUCT_OUT)/boot.img
$(PRODUCT_OUT)/init_boot.img
$(PRODUCT_OUT)/vendor_boot.img
$(PRODUCT_OUT)/vendor-bootconfig.img
```

只有在 `vendor_kernel_boot` 分割區啟用且對應模組已建立時，才會出現
`vendor_kernel_boot.img`。

## DTB 與 DTBO

`uwu_kernel` 可以提供 `.dtb` 與 `.dtbo` 輸出。在 Soong-only 模式下，fsgen 可以從
核心模組標籤讀取 DTBO：

```text
:kernel{.dtbo}
```

裝置也可以透過 `BOARD_PREBUILT_DTBOIMAGE` 提供預編譯 DTBO。DTBO 的 page size、AVB
參數與輸出名稱來自分割區設定。DTBO 模組會將輸出提供給 vbmeta，同時安裝到 Soong
的 `etc` 輸出目錄；`android_device` 會將最終映像複製到 `PRODUCT_OUT/dtbo.img`。

常見的 QCOM 流程為：

1. Kbuild 生成多個 DTB/DTBO；
2. `merge_dtbs.py` 合併並整理裝置樹；
3. `mkdtboimg create --page_size=<size>` 生成 DTBO；
4. fsgen 將 DTB/DTBO 接入 boot、DTBO 與 vbmeta 相依性。

## AVB 與 super

每個啟用 AVB 的分割區都從 `PartitionQualifiedVariables` 取得自己的 key、algorithm、
rollback index 與 footer 參數。fsgen 負責建立分割區 AVB 資訊，vbmeta 模組則依照
`vbmeta_*` 分割區清單建立鏈式相依性。

動態分割區產品的相依關係通常如下：

```text
system/product/vendor/odm/... filesystem
                |
                v
              super
                |
                v
          vbmeta_system/vendor
                |
                v
              vbmeta
```

不要在裝置設定中手動複製這個相依關係。應設定正確的 BoardConfig 變數，讓 fsgen
從產品設定自動建立模組。

## 產品輸出

產品輸出目錄通常是 `out/target/product/<device>`。常見輸出包括：

| 輸出 | 說明 |
| --- | --- |
| `kernel` | `uwu_kernel` 的預設核心映像輸出 |
| `dtb.img` | 裝置樹映像，是否合併取決於裝置設定 |
| `dtbo.img` | DTBO 映像，page size 取決於產品設定 |
| `boot.img` | boot 映像 |
| `init_boot.img` | init_boot 映像 |
| `vendor_boot.img` | vendor boot 映像 |
| `system.img`、`vendor.img`、`product.img` | 動態分割區成員映像 |
| `super.img` | 動態分割區容器映像 |
| `vbmeta*.img` | AVB 鏈映像 |

`boot_16k.img`、`vendor_kernel_boot.img` 等特殊映像只有在對應產品分割區與核心
設定啟用時才會生成。缺少未啟用的映像不代表 Soong-only 建置失敗。
