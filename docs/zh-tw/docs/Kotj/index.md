# Kotj

Kotj 是 uwuAOSP 隨系統編譯的本機備忘錄應用程式，使用 Kotlin、Jetpack Compose 和 Material 3，套件名稱為 `com.lopleec.kotj`。

## 系統整合

`vendor/uwu/config/common.mk` 將 `Kotj` 加入通用產品套件清單。因此，使用 uwuAOSP 通用設定的手機、平板和摺疊裝置都會從原始碼編譯並預裝它，而不是下載預編譯 APK。

只編譯 Kotj：

```sh
uni -j$(nproc) Kotj
```

## 功能

- 富文字、標題、清單、核取方塊、表格和圖片。
- 分類、置頂、搜尋、最近刪除和自動清理。
- 匯入 TXT、Markdown、RTF 和 DOCX。
- 匯出純文字、Markdown 和 DOCX。
- 使用獨立密碼或 Android 系統驗證保護加密筆記。

## 資料與隱私

Kotj 不要求網路權限。筆記、附件、分類和設定儲存在應用程式私有空間，不會上傳遙測或筆記內容。

密碼模式使用 PBKDF2-HMAC-SHA256 衍生 AES-256 金鑰，並以 AES-GCM 加密筆記和附件。系統解鎖模式使用 Android Keystore 包裝隨機金鑰。開啟加密內容時會阻止截圖和最近工作預覽。

遺失獨立密碼、系統解鎖金鑰或清除應用程式資料後，加密筆記無法復原。ROM 更新不會主動清除應用程式資料，但刷機前仍應匯出重要內容。

## 上游

Kotj 的獨立原始碼和完整使用說明位於 [UwUniverse/Kotj](https://github.com/UwUniverse/Kotj)。uwuAOSP 只負責系統編譯整合，不改變其本機儲存和加密邊界。
