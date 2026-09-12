# uwu_kernel 設定參考

## 頂層屬性

| 屬性 | 說明 |
| --- | --- |
| `kernel_dir` | 相對於 Android 原始碼根目錄的核心原始碼目錄，原始碼建置必填 |
| `prebuilt` | 預編譯核心路徑，設定後略過原始碼 Kbuild |
| `prebuilt_config` | 預生成的 `.config` 檔案，僅用於 `prebuilt` |
| `prebuilt_headers` | gzip 壓縮的核心 UAPI headers archive，僅用於 `prebuilt` |
| `prebuilt_modules` | 預生成的核心 modules zip，僅用於 `prebuilt` |
| `kernel_arch` | Kbuild 架構，例如 `arm64` |
| `image_name` | `arch/<arch>/boot` 下的核心檔案名稱，原始碼建置必填 |
| `clang_version` | `prebuilts/clang/host/linux-x86` 下的工具鏈版本 |
| `clang_path` | 自訂 Clang 目錄，優先於 `clang_version` |
| `rust_version` | 可選的 Rust 工具鏈版本 |
| `clang_triple` | 覆寫預設的 `CLANG_TRIPLE` |
| `cross_compile` | 傳給 Kbuild 的 `CROSS_COMPILE` |
| `cc` / `ld` | 覆寫預設的 C 編譯器或連結器 |
| `autofdo_profile` | AutoFDO profile 路徑，預設尋找 GKI profile，設定為 `none` 可停用 |
| `rbe_wrapper` | 完整的 `rewrapper` 指令，設定後使用 `kernel_rbe_cc.sh` 實際編譯 |
| `make_command` | 覆寫 tree 內的 `make` 指令 |
| `build_jobs` | 覆寫 Kbuild 的 `-j` 平行度 |
| `make_flags` | 傳給所有 Kbuild 呼叫的變數或參數 |
| `additional_flags` | 裝置額外的 Kbuild 設定參數 |
| `environment` | 傳給 Kbuild action 的額外環境賦值 |
| `srcs` | 額外的分析階段輸入，不用來取代原始碼目錄相依性 |

預設 Kbuild 平行度以整數計算 `(邏輯 CPU 數量 + 2) * 3 / 2`。只有在主機記憶體不足
或核心存在平行問題時，才需要降低 `build_jobs`。

未明確設定 `clang_version` 與 `rust_version` 時，會優先使用 envsetup 匯出的
`LLVM_AOSP_PREBUILTS_VERSION` 與 `RUST_AOSP_PREBUILTS_VERSION`，再分別回退至
`clang-stable` 與不加入 Rust 工具鏈路徑。

`environment` 中的每一項都必須是 `NAME=value`，並會作為 Kbuild action 的 shell
環境變數。需要傳遞 Make 變數時，應使用 `make_flags` 或 `additional_flags`。

## Kconfig

```bp
config: {
    defconfig: "gki_defconfig",
    fragments: [
        "vendor/common.config",
        "vendor/device.config",
    ],
    merge_at_once: true,
    overrides: [
        "CONFIG_EXAMPLE=y",
    ],
    lto: "thin",
},
```

設定處理順序如下：

1. 以 `defconfig` 初始化 `.config`；
2. 執行 `olddefconfig`；
3. 依序或一次性合併 `fragments`；
4. 根據 `lto` 修改 LTO 選項；
5. 附加 `overrides`；
6. 最後再次執行 Kconfig 的預設值處理。

`lto` 支援 `none`、`thin` 與 `full`。fragment 和 override 的最終結果應透過生成的
`.config` 驗證，而不是只檢查來源檔案。

不包含 `/` 的設定名稱，以及以 `vendor/` 開頭的設定名稱，會依照以下路徑解析：

```text
<kernel_dir>/arch/<config_arch>/configs/<name>
```

其他包含 `/` 的名稱會以 Android 原始碼根目錄解析。例如 `kernel/vendor/foo.config`
可以直接指向原始碼根目錄下的檔案。`x86_64` 的 defconfig 目錄仍會轉換為
`arch/x86/configs`。

## DTB 與 DTBO

```bp
dtb: {
    enabled: true,
    qcom_merge: true,
    target: "dtbs",
    image_name: "dtb.img",
},
dtbo: {
    enabled: true,
    target: "dtbs",
    image_name: "dtbo.img",
    page_size: 4096,
},
```

| 屬性 | 說明 |
| --- | --- |
| `enabled` | 啟用此類裝置樹輸出 |
| `qcom_merge` | 使用 uwuAOSP 的 QCOM DT 合併流程 |
| `src` | 預編譯 DTB/DTBO 輸入 |
| `target` | 傳給 Kbuild 的目標，預設為 `dtbs` 或 `dtbo.img` |
| `image_name` | 輸出名稱，預設為 `dtb.img` 或 `dtbo.img` |
| `config` | `mkdtboimg cfg_create` 使用的設定檔 |
| `input_globs` | Kbuild 未直接生成最終映像時，用來收集 DT 檔案的 glob |
| `page_size` | `mkdtboimg create` 使用的 DTBO page size，預設為 4096 |
| `custom_command` | 標準流程無法涵蓋時使用的指令 |

`dtb.src` 與 `dtbo.src` 只適用於 `prebuilt` 核心。原始碼建置應透過 Kbuild target 或
`input_globs` 收集裝置樹輸出。`dtb.config` 與 `dtb.page_size` 目前不支援；QCOM
merge 模式使用 `dtb.target`，`dtbo.target` 不生效但會被忽略。

`custom_command` 可使用 `$(kernelDir)`、`$(kernelOut)` 與 `$(out)`。它只能作為最後
手段；重複出現的流程應實作為通用能力。

啟用 `qcom_merge` 時，`dtb.enabled` 與 `dtbo.enabled` 必須同時為 true。QCOM 合併
流程會從核心 DTS 輸出建立獨立的 merge 工作目錄，再分別生成 DTB 與 DTBO；Kbuild
本身仍使用共用的 `kernel_build` 輸出目錄。

## Modules

```bp
modules: {
    enabled: true,
    build_targets: ["modules"],
    external_module_root: "kernel/vendor/device-modules",
    external_modules: [
        "vendor/example",
        "vendor/kbuild-module:kbuild",
    ],
    install_strip: true,
    auto_collect_deps: true,
    system_dlkm_module_install_list: ["modules.include.system_dlkm"],
    system_dlkm_module_load_list: ["modules.load.system_dlkm"],
    vendor_dlkm_module_install_list: ["modules.include.vendor_dlkm"],
    vendor_dlkm_module_load_list: ["modules.load.vendor_dlkm"],
    recovery_module_install_list: ["modules.include.recovery"],
    recovery_module_load_list: ["modules.load.recovery"],
},
```

模組安裝集合支援 `system_dlkm`、`vendor_dlkm`、`vendor_ramdisk` 與 `recovery`。
每一類都必須同時提供 install list 與 load list；load list 必須是 install list 的
子集。每一類也可以設定對應的 blocklist。

一般 `external_modules` 項目會依照外部模組自己的 Makefile 建置；帶有 `:kbuild`
後綴的項目使用核心 Kbuild 的 `M=` 模式。`module_aliases` 使用
`old_name.ko:new_name.ko` 格式。`auto_collect_deps` 會根據生成的模組相依性補充
安裝集合。

啟用 `auto_collect_deps` 時，原始碼樹中還需要
`lineage/scripts/collect-kernel-module-deps/collect-kernel-module-deps.py`。每類分割
區只有在設定 install list 或 load list 時才會建立內部 installer；一旦設定其中一個，
另一個也必須設定。`vendor_dlkm` 在同時啟用 `system_dlkm` 時會依賴 system_dlkm installer。

RBE wrapper 只包裝實際的 C/組合語言編譯，預處理、組合、相依分析等其他 clang 呼叫仍
在本機執行。`rbe_wrapper` 應包含所需的 rewrapper 參數，例如：

```bp
rbe_wrapper: "prebuilts/remoteexecution-client/live/rewrapper --labels=type=compile,lang=cpp,compiler=clang",
```

## 裝置設定

完整設定應位於裝置樹的 `Android.bp`。本文只列出設定模型，不複製裝置專屬的模組清單、
DT 輸入與核心路徑。不同裝置可以選擇不同的架構、工具鏈、DT 流程與模組分割區，但都
應透過同一個 `uwu_kernel` 模組介面表達。
