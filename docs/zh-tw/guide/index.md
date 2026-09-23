# 快速開始

## 建置 uwuAOSP

本頁內容適用於你找不到適用於你機型的 OTA 套件，或者想要自行開發的情況。

16.2：你需要手動 bring-up（也就是將你的 `lineage_` 裝置樹適配到 uwuAOSP 上）。這只需要將 `lineage_` 簡單重新命名為 `custom_`。

17.0：請使用 uwuCLI 轉換你的裝置樹。如有問題，請向 [uwuCLI](https://github.com/UwUniverse/uwuCLI) 提出 Issue。

## 簽名發佈 OTA

首次使用時，在原始碼樹中執行一次初始化。金鑰目錄必須位於原始碼樹外，而且事先不能存在：

```sh
uni --init-signing-keys ~/.android-certs
```

若已有手動產生的金鑰目錄，可略過初始化。完成 `lunch` 後，每次發佈都使用同一目錄：

```sh
uni -j$(nproc) otapackage --sign-keys ~/android-certs
```

Uni 會建置 `target-files-package` 和 `otatools`，重新簽署 APK/APEX 與 OTA，並寫出 SHA-256 驗證檔。Uni 初始化的目錄會依 target-files 清單產生並重用 APEX 金鑰；手動產生的金鑰目錄不會被修改。簽名產物位於 `out/release/<產品名稱>/`。額外 APK 與 AVB 金鑰需依裝置設定；請參閱 [Uni 簽名說明](/zh-tw/docs/uni/#簽名發佈-ota)。

請在另一個儲存裝置上安全備份金鑰目錄。刪除原始碼樹不影響金鑰；若金鑰遺失，新產生的金鑰無法直接延續原裝置的一般 OTA 更新。

需要對既有 target-files 做隔離驗證時：

```sh
uni --sign-keys ~/android-certs --sign-check
```
