# 设备维护者信息

设备树可以声明负责该产品构建和适配的维护者。有效值会写入只读系统属性，并显示在 **设置 → 系统 → 软件更新** 的应用更新项目下方。

## 设备树配置

在产品 `.mk` 文件继承 `vendor/uwu/config/common.mk` 前设置：

```make
UWU_MAINTAINER := bk233
```

构建系统会生成：

```text
ro.uwu.maintainer=bk233
```

值为空时不会生成属性，设置页面也不会显示空项目。名称最多 64 个字符，可使用字母、数字、空格、点、下划线、连字符和 `@`。

## 使用迁移工具

把 LineageOS 产品树迁移到 uwuAOSP 时，可以同时写入维护者：

```sh
uwu product migrate lineage apply \
  --device nabu \
  --type tablet \
  --no-telephony \
  --maintainer bk233
```

交互模式也会询问维护者名称。`plan` 或 `--dry-run` 可以在修改设备树前查看结果。

## 显示规则

软件更新页面读取 `ro.uwu.maintainer`，按当前系统语言显示“维护者”或“Maintainer”。该字段只描述产品维护者，不参与 OTA 身份校验、签名或更新渠道选择。
