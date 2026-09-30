# Soong-only

Android 建置圖的生成流程包含一個串行執行的 Kati 階段。Kati 負責處理 Make 建置規則，並生成對應的 Ninja 建置規則。

LineageOS 在 23.2 release blog 中提到：

> LineageOS is now nearly Android.mk free! Google announced their move from make to
> soong many years ago, pushing developers to migrate from Android.mk to Android.bp,
> and has started blocking Android.mk in many locations of the source tree.

然而，部分核心建置元件仍依賴 Make，因此 Kati 仍是建置流程中不可略過的一環。

uwuAOSP 持續完成這項遷移的最後一步，讓現代裝置可以略過 Kati 的主要建置圖生成階段。在我們的測試中，這使建置圖生成時間幾乎減半。產品設定（例如 BoardConfig）仍使用 Make；Soong-only 並不代表裝置樹不能使用 Makefile。

## 遷移裝置

對於現代裝置，uwuAOSP 已處理 Soong-only 所需的大部分建置元件。裝置移植時通常只需要遷移以下部分：

- [`uwu_kernel`](uwu_kernel/)：取代舊有的核心建置工作；
- `uwu_prebuilt_image`：取代 Make 層的 `$(call add-radio-file, ...)`。

uwuCLI 提供遷移腳本，簡化裝置移植流程。腳本完成機械式轉換後，仍請檢查並驗證生成的建置規則。

若要暫時啟用 Soong-only，請設定環境變數：

```bash
export SOONG_ONLY=true
```

也可以在產品設定中設定：

```make
PRODUCT_SOONG_ONLY := true
```

> [!NOTE]
> A-only 裝置依賴的 `//bootable/deprecated-ota:updater` 尚未完成遷移，因此目前不能使用 Soong-only。若需要支援此類裝置，請在 issue tracker 提出 issue。

## 驗證

遷移完成後，至少完成一次完整建置，並確認裝置能正常開機且主要功能可用。請勿透過固定的映像清單判斷遷移是否成功。

以下裝置已完成 Soong-only 建置與開機驗證：

- OnePlus 6T (`fajita`)
- OnePlus Ace 3 / 12R (`aston(c)`)
