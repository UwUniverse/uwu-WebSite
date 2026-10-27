# 快速开始

## 构建uwuAOSP

本页内容适合您发现没有对应您机型的 OTA 包或者想要自行开发的情形。

16.2：您需要手动 bringup（也就是将您的 lineage 设备树适配到 uwuAOSP 上）。这只是很简单的 lineage_ -> custom_ 改名。

17.0：请使用 uwuCLI 转换您的设备树。如有问题，请向 [uwuCLI](https://github.com/UwUniverse/uwuCLI) 提出 Issue。

## 签名发布 OTA

首次使用时，在源码树中执行一次初始化。密钥目录应放在源码树外，且不能预先存在：

```sh
uni --init-signing-keys ~/.android-certs
```

已有手动生成的密钥目录可跳过初始化。完成 `lunch` 后，每次发布都使用同一目录：

```sh
uni otapackage --sign-keys ~/.android-certs
```

uni 会构建 `target-files-package` 和 `otatools`，重签 APK/APEX 与 OTA，并写出 SHA-256 校验文件。签名产物位于 `out/release/<产品名>/`。额外 APK 和 AVB 密钥需要按设备配置；参见 [uni 签名说明](/docs/uni/#ota-签名)。

请在另一块存储设备上备份密钥目录。丢失密钥后，新生成的密钥无法直接延续原设备的常规 OTA 更新。

需要对已有 target-files 做隔离验证时：

```sh
uni --sign-keys ~/.android-certs --sign-check
```

## 配置 OTA 更新

原生更新器通过维护者提供的 HTTPS 更新源检查新版本。

1. 在设备树的产品 Makefile 中加入资源覆盖目录：

   ```make
   PRODUCT_PACKAGE_OVERLAYS += device/<vendor>/<device>/overlay
   ```

2. 在该目录下的 `packages/apps/Updater/app/src/main/res/values/config.xml` 中填写更新源：

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <string name="updater_server_url" translatable="false">https://ota.example.org/{device}/{type}.json</string>
   </resources>
   ```

   替换设备树路径和示例域名。`{device}` 读取设备代号，`{type}` 读取小写发布渠道；也可以直接填写固定地址。

3. 上传最终签名 OTA ZIP，并在更新源地址发布 JSON 数组。列表须包含目标版本、构建时间戳、渠道，以及文件直链、字节数、SHA-256 和 SDK。没有更新时返回 `[]`。
4. 构建并安装包含配置的系统，在 **设置 > 系统 > 软件更新** 中验证检查、下载和安装。

完整字段、流式安装配置和验证命令见 [设备移植指南 - 配置 OTA 更新](/docs/bringup-17/#ota-updates)。
