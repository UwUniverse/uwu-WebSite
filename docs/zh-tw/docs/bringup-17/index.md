# uwuAOSP 裝置移植指南（17.0+）

本指南說明建置 uwuAOSP 所需的最少裝置樹修改，以及改善開發體驗的選用調整。

## 必要項目（第一階段）

為方便起見，請使用 uwuCLI 進行裝置移植：

```bash
uwu
```

選擇語言，再選擇「改造 LineageOS 產品裝置樹」，接著腳本會詢問幾個問題。

第三個問題中的維護者名稱最多 64 個字元，可使用英文字母、數字、空格、句點、底線、連字號及 `@`。此欄位可以留空。

維護者資訊會顯示於「設定 -> 系統 -> 軟體更新」。

### 手動修改

請在裝置樹的 `device.mk` 或等效 Makefile 中設定以下旗標：

```
# Device type
# Select from phone, tablet, or foldable.
UWU_DEVICE_TYPE := phone

# Whether the device supports telephony
# Select from true or false.
UWU_SUPPORTS_TELEPHONY := true

# OPTIONAL: Device maintainer
UWU_MAINTAINER := Akaza_Akari
```

## 選用項目（第二階段）

> [!WARNING]
> Soong-only 並非啟動 uwuAOSP 的必要條件。

> [!NOTE]
> 如需了解 Soong-only 對裝置的優點與限制，請參閱[此處](https://uwuaosp.uwuniverse.org/docs/soong-only/)。

若要遷移至 Soong-only，uwuAOSP 建議進行以下修改：

### 遷移至 uwu_prebuilt_image

第一階段結束時，uwuCLI 會詢問是否寫入第一階段的修改。寫入後，如果裝置透過 `$(call add-radio-file,...)` 加入韌體映像，uwuCLI 會接著詢問是否轉換 radio image 的整合方式。

若要啟用 Soong-only，必須完成此步驟。

### 遷移至 uwu_kernel

請依照[uwu_kernel 遷移指南](https://uwuaosp.uwuniverse.org/docs/soong-only/uwu_kernel/migration.html)進行遷移。

詳細資訊請參閱 [uwu_kernel 文件](https://uwuaosp.uwuniverse.org/docs/soong-only/uwu_kernel/)。

### 檢查阻礙 Soong-only 遷移的套件

完成 lunch 後，請執行：

```bash
uwu inspect soong-only
```

uwuCLI 會檢查裝置及其所有相依項目，這需要一些時間，實際時間視裝置而定。

若腳本顯示以下結果，即可切換至 Soong-only：

```text
Conclusion
--------------------
  READY
  No selected package still depends on Android.mk.
```
