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
uni otapackage --sign-keys ~/.android-certs
```

uni 會建置 `target-files-package` 和 `otatools`，重新簽署 APK/APEX 與 OTA，並寫出 SHA-256 驗證檔。uni 初始化的目錄會依 target-files 清單產生並重用 APEX 金鑰；手動產生的金鑰目錄不會被修改。簽名產物位於 `out/release/<產品名稱>/`。額外 APK 與 AVB 金鑰需依裝置設定；請參閱 [uni 簽名說明](/zh-tw/docs/uni/#簽名發佈-ota)。

請在另一個儲存裝置上安全備份金鑰目錄。刪除原始碼樹不影響金鑰；若金鑰遺失，新產生的金鑰無法直接延續原裝置的一般 OTA 更新。

需要對既有 target-files 做隔離驗證時：

```sh
uni --sign-keys ~/.android-certs --sign-check
```

## 設定 OTA 更新

原生更新器透過維護者提供的 HTTPS 更新來源檢查新版本。簽名建置只產生更新套件，不會自動上傳檔案或發佈更新清單。

1. 在裝置樹的產品 Makefile 中加入資源覆蓋目錄：

   ```make
   PRODUCT_PACKAGE_OVERLAYS += device/<vendor>/<device>/overlay
   ```

2. 在該目錄下的 `packages/apps/Updater/app/src/main/res/values/config.xml` 中填寫更新來源：

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <string name="updater_server_url" translatable="false">https://ota.example.org/{device}/{type}.json</string>
   </resources>
   ```

   替換裝置樹路徑和範例網域。`{device}` 讀取裝置代號，`{type}` 讀取小寫發佈管道；也可直接填入固定網址。

3. 上傳最終簽名 OTA ZIP，並在更新來源網址發佈 JSON 陣列。清單須包含目標版本、建置時間戳記、管道，以及檔案直連、位元組數、SHA-256 和 SDK。沒有更新時回傳 `[]`。
4. 建置並安裝包含設定的系統，在 **設定 > 系統 > 軟體更新** 中驗證檢查、下載和安裝。

完整欄位、串流安裝設定與驗證指令請參閱[裝置移植指南 - 設定 OTA 更新（簡體中文）](/docs/bringup-17/#ota-updates)。未設定更新來源時，仍可使用本機匯入。官網更新日誌頁面不是 OTA 更新來源，不能填入上述網址。
