# uwu_kernel 設定參考

## 頂層屬性

| 屬性 | 說明 |
| --- | --- |
| `kernel_dir` | 相對於 Android 原始碼根目錄的核心原始碼目錄；source build 必填 |
| `prebuilt` | 預編譯核心路徑；設定後略過 source Kbuild |
| `prebuilt_config` | 生成的 `.config`；僅用於 `prebuilt` |
| `prebuilt_headers` | gzip 壓縮的核心 UAPI headers archive；僅用於 `prebuilt` |
| `prebuilt_modules` | 預先生成的核心 modules zip；僅用於 `prebuilt` |
| `kernel_arch` | Kbuild 架構，例如 `arm64` |
| `image_name` | `arch/<arch>/boot` 下的核心檔名；source build 必填 |
| `clang_version` | `prebuilts/clang/host/linux-x86` 下的工具鏈版本 |
| `clang_path` | 自訂 Clang 目錄，優先於 `clang_version` |
| `rust_version` | 選用的 Rust 工具鏈版本 |
| `clang_triple` | 覆寫預設的 `CLANG_TRIPLE` |
| `cross_compile` | 傳給 Kbuild 的 `CROSS_COMPILE` |
| `cc` / `ld` | 覆寫預設的 C 編譯器或連結器 |
| `autofdo_profile` | AutoFDO profile 路徑；預設尋找 GKI profile，設為 `none` 可停用 |
| `rbe_wrapper` | 完整的 `rewrapper` 命令；設定後由 `kernel_rbe_cc.sh` 執行實際編譯 |
| `make_command` | 覆寫 tree 內的 `make` |
| `build_jobs` | 覆寫 Kbuild 的 `-j` 平行度 |
| `make_flags` | 傳給所有 Kbuild 呼叫的變數或參數 |
| `additional_flags` | 裝置額外的 Kbuild 參數，主要用於遷移 `TARGET_KERNEL_ADDITIONAL_FLAGS` |
| `environment` | 傳給 Kbuild action 的額外環境設定 |
| `srcs` | 額外的分析期輸入，不可取代原始碼目錄相依性 |

預設 Kbuild 平行度使用整數運算計算：`(邏輯 CPU 數 + 2) * 3 / 2`。

未明確設定 `clang_version` 和 `rust_version` 時，會優先使用 envsetup 匯出的 `LLVM_AOSP_PREBUILTS_VERSION` 和 `RUST_AOSP_PREBUILTS_VERSION`。Clang 接著回退至 `clang-stable`；未設定 Rust 版本時，不會加入 Rust 工具鏈路徑。

`environment` 的每個項目都必須使用 `NAME=value` 格式，並作為 Kbuild action 的 shell 環境變數。若要傳遞 Make 變數，請使用 `make_flags` 或 `additional_flags`。

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

1. 使用 `defconfig` 初始化 `.config`；
2. 執行 `olddefconfig`；
3. 依序或一次合併 `fragments`；
4. 根據 `lto` 修改 LTO 選項；
5. 附加 `overrides`；
6. 最後再次執行 `olddefconfig`。

`lto` 支援 `none`、`thin` 和 `full`。請透過生成的 `.config` 驗證 fragment 和 override 的最終結果，不要只檢查來源檔案。

不含 `/` 的設定名稱，以及以 `vendor/` 開頭的名稱，會依以下路徑解析：

```text
<kernel_dir>/arch/<config_arch>/configs/<name>
```

其他符合條件的路徑可相對於 Android 原始碼根目錄解析。例如 `kernel/vendor/foo.config` 會直接指向原始碼根目錄下的檔案。`x86_64` 的 defconfig 目錄仍會轉換為 `arch/x86/configs`。

## DTB 和 DTBO

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
| `qcom_merge` | 使用 uwuAOSP 的 QCOM DT merge 流程 |
| `src` | 預編譯 DTB/DTBO 輸入 |
| `target` | 傳給 Kbuild 的 target；預設為 `dtbs` 或 `dtbo.img` |
| `image_name` | 輸出名稱；預設為 `dtb.img` 或 `dtbo.img` |
| `config` | `mkdtboimg cfg_create` 使用的設定檔 |
| `input_globs` | Kbuild 未直接生成最終映像時，用於收集 DT 檔案的 glob |
| `page_size` | `mkdtboimg create` 使用的 page size，預設為 4096 |
| `custom_command` | 標準流程無法處理時使用的命令 |

`dtb.src` 和 `dtbo.src` 僅適用於 prebuilt kernel。Source build 應透過 Kbuild target 或 `input_globs` 收集裝置樹輸出。目前不支援 `dtb.config` 和 `dtb.page_size`。

`custom_command` 可使用 `$(kernelDir)`、`$(kernelOut)` 和 `$(out)`。只有在最後手段才使用；重複出現的流程應實作為通用功能。

啟用 `qcom_merge` 時，`dtb.enabled` 和 `dtbo.enabled` 必須同時為 `true`。QCOM merge 會使用 `dtb.target` 執行 Kbuild，接著從 kernel DTS 輸出建立獨立的 merge 工作目錄並生成 DTB 和 DTBO；此模式不使用 `dtbo.target`。

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

模組安裝集合支援 `system_dlkm`、`vendor_dlkm`、`vendor_ramdisk` 和 `recovery`。每類都必須同時提供 install list 和 load list；load list 必須是 install list 的子集。每類也可以設定對應的 blocklist。

一般 `external_modules` 項目會使用 external module 自己的 Makefile 建置，預設 target 為 `all`；`:all` 可明確指定相同行為。帶有 `:kbuild` 後綴的項目會使用主要核心 Kbuild 的 `M=` 模式。

`module_aliases` 使用 `old_name.ko:new_name.ko` 格式。

啟用 `auto_collect_deps` 後，`uwu_kernel` 會自動收集 install list 中模組的相依項目，並補入最終安裝集合。這需要原始碼樹中存在 `lineage/scripts/collect-kernel-module-deps/collect-kernel-module-deps.py`。

`vendor_dlkm_install_all` 會將所有未安裝至 `system_dlkm` 的已建置模組加入 `vendor_dlkm` install list。

只有在設定 install list 或 load list 時才會建立該分割區的 installer；設定其中一項後，另一項也必須設定。同時啟用 `system_dlkm` 時，`vendor_dlkm` 會依賴 system_dlkm installer。

## RBE wrapper

RBE wrapper 只包裝實際的 C/組合語言原始碼編譯。預處理、`-S`、相依性生成等其他 Clang 呼叫仍會在本機執行。

`rbe_wrapper` 應包含所需的 rewrapper 參數，例如：

```bp
rbe_wrapper: "prebuilts/remoteexecution-client/live/rewrapper --labels=type=compile,lang=cpp,compiler=clang",
```
