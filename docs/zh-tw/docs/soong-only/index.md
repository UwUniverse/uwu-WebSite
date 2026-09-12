# Soong-only 建置文件

本文件說明 uwuAOSP 如何在 Android 產品設定仍由 Make 解析的前提下，使用 Soong
產生建置目標、映像與核心產物。同時也說明 `uwu_kernel` 與舊版 Make 核心建置系統
之間的設定關係。

## 為什麼使用 Soong-only

Soong 的目標是讓 Android 建置不再依賴 Makefile 產生建置目標。產品設定仍可使用
Make，但建置目標與 Ninja 規則會直接由 Soong 從模組圖產生，略過 Kati 的主要目標
生成階段。

略過 Kati 的主要好處是降低建置分析負擔。Soong 官方文件提出的目標是將分析時間
降低至約一半，進而提升開發效率。這項收益主要體現在建置啟動與相依圖分析階段；
它不會略過 Ninja 執行的編譯動作，也不會略過 `uwu_kernel` 內部呼叫的 Linux Kbuild。

Soong-only 不能簡單理解為「移除所有 Make」。Make 仍負責產品設定與變數展開，
但不再負責將 Android.mk 目標轉換成主要 Ninja 圖。

## 文件導覽

| 頁面 | 內容 |
| --- | --- |
| [建置流程](build-flow.md) | `PRODUCT_SOONG_ONLY`、設定匯出與 Soong 建置圖 |
| [映像生成](image-generation.md) | fsgen、boot/DTBO/vbmeta/super 映像與輸出位置 |
| [建置驗證](validation.md) | 驗證指令、產物檢查與增量建置檢查 |
| [uwu_kernel 建置系統](uwu_kernel/) | `uwu_kernel` 頁面索引與職責邊界 |

## 基本概念

Soong-only 並未完全移除 Make。產品設定仍需要 Make 讀取產品繼承關係並產生 Soong
設定變數。差異在於產品設定完成後，主要建置目標與 Ninja 規則由 Soong 產生，Kati
的主要目標生成階段不再執行。

產品使用 Soong-only 所需的設定為：

```make
PRODUCT_SOONG_ONLY := true
```

也可以使用命令列參數暫時選擇模式：

```sh
m --soong-only <target>
m --no-soong-only <target>
```

`SOONG_ONLY=true` 是等價的環境變數入口。命令列參數優先於產品預設值。

裝置的關鍵設定通常位於：

- `device/<vendor>/<device>/BoardConfig*.mk`：啟用 Soong 核心並指定模組；
- `device/<vendor>/<device>/Android.bp`：宣告 `uwu_kernel`；
- `device/<vendor>/<device>/device.mk`：將核心安裝到產品中；
- `vendor/uwu/config/BoardConfigSoong.mk`：將核心選擇匯出給 Soong。

是否生成某個映像由產品的分割區設定決定，不能只根據 Soong-only 模式推斷所有映像
都存在。

## 參考實作

- Android 原生 Soong-only 說明：`build/soong/docs/soong_only.md`
- Soong 最佳實務：`build/soong/docs/best_practices.md`
