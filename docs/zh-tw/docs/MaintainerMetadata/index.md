# 裝置維護者資訊

裝置樹可以宣告負責產品編譯和適配的維護者。有效值會寫入唯讀系統屬性，並顯示在 **設定 → 系統 → 軟體更新** 的應用程式更新項目下方。

## 裝置樹設定

在產品 `.mk` 檔案繼承 `vendor/uwu/config/common.mk` 前設定：

```make
UWU_MAINTAINER := bk233
```

編譯系統會產生：

```text
ro.uwu.maintainer=bk233
```

值為空時不會產生屬性，設定頁面也不會顯示空項目。名稱最多 64 個字元，可使用字母、數字、空格、句點、底線、連字號和 `@`。

## 使用遷移工具

將 LineageOS 產品樹遷移至 uwuAOSP 時，可以同時寫入維護者：

```sh
uwu product migrate lineage apply \
  --device nabu \
  --type tablet \
  --no-telephony \
  --maintainer bk233
```

互動模式也會詢問維護者名稱。使用 `plan` 或 `--dry-run` 可以在修改裝置樹前檢視結果。

## 顯示規則

軟體更新頁面讀取 `ro.uwu.maintainer`，依目前系統語言顯示「維護者」或「Maintainer」。這個欄位只描述產品維護者，不參與 OTA 身分驗證、簽章或更新頻道選擇。
