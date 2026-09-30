# uwu_kernel 輸出

`uwu_kernel` 透過 Soong output label 向其他模組提供核心建置產物。

## 輸出標籤

| 標籤 | 輸出 |
| --- | --- |
| 預設標籤 | Kernel image |
| `.config` | 最終核心設定 |
| `.dtb` | DTB image |
| `.dtbo` | DTBO image |
| `.modules` | 核心模組封存檔 |

例如，名為 `kernel` 的 `uwu_kernel` 模組可以透過以下方式引用：

```text
:kernel
:kernel{.config}
:kernel{.dtb}
:kernel{.dtbo}
:kernel{.modules}
```

除預設的 Kernel image 外，其他標籤只有在對應輸出存在時才可用。例如，只有啟用 DTBO 輸出後才會提供 `.dtbo`。

裝置設定和其他 Soong 模組應透過這些標籤引用核心輸出，請勿依賴 `out/soong/.intermediates` 中的特定路徑。

## Kernel headers

Kernel UAPI headers 不會透過 output label 暴露。`uwu_kernel` 會執行 Kbuild `headers_install` 並清理生成的 headers，再透過 Generated headers 介面提供給其他模組。

`generated_kernel_includes` 會使用 `SOONG_KERNEL_MODULE` 所指向的 `uwu_kernel` 提供 headers。這可維持目前 Android tree 中依賴 `generated_kernel_includes` 的 library 相容性。

## Kernel modules

啟用 kernel modules 後，`.modules` 會提供建置生成的 kernel modules archive。`uwu_kernel` 會根據 `modules` 中宣告的 install list、load list 和 blocklist 建立對應分割區的 module installer。

裝置不需要直接加入這些內部 installer。只要將主要的 `uwu_kernel` module 加入產品即可：

```device.mk
PRODUCT_PACKAGES += kernel
```

核心模組的分割區和載入設定請參閱[設定參考](configuration.md)。
