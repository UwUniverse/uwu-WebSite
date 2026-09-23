# 快速開始

## 建置 uwuAOSP

本頁內容適用於你找不到適用於你機型的 OTA 套件，或者想要自行開發的情況。

16.2：你需要手動 bring-up（也就是將你的 `lineage_` 裝置樹適配到 uwuAOSP 上）。這只需要將 `lineage_` 簡單重新命名為 `custom_`。

17.0：請使用 uwuCLI 轉換你的裝置樹。如有問題，請向 [uwuCLI](https://github.com/UwUniverse/uwuCLI) 提出 Issue。

## 簽名發佈 OTA

Uni 可以在產生 target-files 後直接輸出簽名 OTA。金鑰目錄需要包含以下四組金鑰：

```text
releasekey.pk8       releasekey.x509.pem
platform.pk8         platform.x509.pem
shared.pk8           shared.x509.pem
media.pk8            media.x509.pem
```

完成 `lunch` 後執行：

```sh
uni -j$(nproc) otapackage --sign-keys ~/android-certs
```

Uni 會建置 `target-files-package` 和 `otatools`，簽名 APK/APEX 與 OTA，並寫出 SHA-256 驗證檔。簽名產物位於 `out/release/<產品名稱>/`。金鑰只會在簽名階段讀取，不會寫入原始碼樹或一般建置產物。

需要對既有 target-files 做隔離驗證時：

```sh
uni --sign-keys ~/android-certs --sign-check
```
