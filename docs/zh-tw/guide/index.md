# 快速開始

## 建置 uwuAOSP

如果你找不到適用於你機型的 OTA 套件，或者想要自行開發，可以從這裡開始。

對於建置 16.2 的使用者，你需要手動 bring-up（也就是將你的 Lineage 裝置樹適配到 uwuAOSP 上）。請放心，這不會很難，只需要修改一小部分。

對於建置 17.0 的使用者，我們會在正式發布時一併發布 uwuAOSP-Script。你只需要將它 clone 到本地 uwuAOSP 原始碼目錄並執行，即可完成適配。

## 準備原始碼

### 1. 準備 uwuAOSP 原始碼和裝置樹原始碼

你可以在 GitHub 上尋找與你的裝置 CodeName 對應的裝置樹原始碼，並 clone 到 uwuAOSP 原始碼目錄的對應位置。

## uwuAOSP

### 下載

1. 初始化：

```bash
repo init -u https://github.com/uwuAOSP/platform_manifests.git -b uwu-16.2 --git-lfs
```

2. 同步：

```bash
repo sync
```

### 建置

1. 設定環境：

```bash
source build/envsetup.sh
```

2. lunch 裝置：

```bash
lunch custom_devicecode-bp4a-user
```

3. 建置套件：

```bash
m uwu
```
