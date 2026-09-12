# Soong-only 建置驗證

## 建置前

在原始碼根目錄初始化環境並選擇產品：

```sh
source build/envsetup.sh
lunch uwu_device-cp2a-user
```

產品名稱以裝置的 `AndroidProducts.mk` 為準。驗證不同裝置時，應使用該裝置自己的
分割區與核心設定。

## 目標驗證

先建置 Soong-only 的主要目標：

```sh
m --soong-only bootimage
m --soong-only dtboimage
m --soong-only superimage
m --soong-only vbmetaimage
```

完整產品建置可以使用：

```sh
m --soong-only
```

如果產品設定了 `PRODUCT_SOONG_ONLY := true`，也可以省略 `--soong-only`。

## 產物檢查

檢查主要輸出是否存在且非空：

```sh
for image in kernel dtb.img dtbo.img boot.img init_boot.img vendor_boot.img \
        system.img vendor.img product.img super.img vbmeta.img \
        vbmeta_system.img vbmeta_vendor.img; do
    test -s "out/target/product/<device>/$image" || exit 1
done
```

檢查產品設定記錄的實際分割區與 AVB 參數：

```sh
grep -E '^(avb_|building_|dynamic_partition_list=|has_dtbo=|init_boot=|vendor_boot=)' \
    out/target/product/<device>/misc_info.txt
```

映像格式檢查應使用與產品設定相符的 host 工具。例如已設定 AVB 時可以檢查：

```sh
avbtool info_image --image out/target/product/<device>/boot.img
avbtool info_image --image out/target/product/<device>/dtbo.img
```

## 核心輸出檢查

`uwu_kernel` 的 Soong 中間輸出使用模組標籤，而不是裝置側硬編碼路徑。除錯時可以
查看目前建置的模組目錄：

```text
out/soong/.intermediates/device/<vendor>/<device>/kernel/<variant>/
```

常見輸出標籤對應如下：

| 標籤 | 實際內容 |
| --- | --- |
| 預設輸出 | 核心映像，例如 `kernel/Image` |
| `.config` | `kernel_build/.config` |
| `.dtb` | `dtb/dtb.img` |
| `.dtbo` | `dtbo/dtbo.img` |
| `.modules` | 核心模組 zip，在啟用且被目標使用時生成 |
| generated headers | `headers/usr/include` 等 UAPI 目錄 |

檢查最終設定時，應查看生成的 `.config`：

```sh
grep -E 'CONFIG_(<device-specific-options>|LTO_)' \
    out/soong/.intermediates/device/<vendor>/<device>/kernel/<variant>/kernel_build/.config
```

## Soong-only 差異測試

Google 的 Soong 文件建議比較 Soong-only 與 Soong+Make 的結果。產品設定完成後執行：

```sh
build/soong/scripts/soong_only_diff_test.py <product>
```

該腳本會分別執行兩種模式，建置 target-files 與映像目標，並比較產物差異。差異應
先按照分割區、安裝路徑、檔案清單與映像 metadata 分類，再判斷是裝置設定問題還是
Soong 遷移缺口。

## 增量相依性檢查

修改核心原始碼後，至少驗證以下兩點：

1. `kernel_image` action 會重新執行；
2. 未修改的 Android 分割區不會被無條件重建。

`uwu_kernel` 使用 `source_deps/source.d` 追蹤核心原始碼目錄，不要以
`srcs: ["**/*"]` 取代目錄相依性。

修改 UAPI header、defconfig、fragment、DTB/DTBO 設定或模組清單後，應確認對應的
headers、config、device-tree 或 modules action 會重新執行。
