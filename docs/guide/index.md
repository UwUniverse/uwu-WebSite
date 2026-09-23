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
uni -j$(nproc) otapackage --sign-keys ~/android-certs
```

Uni 会构建 `target-files-package` 和 `otatools`，重签 APK/APEX 与 OTA，并写出 SHA-256 校验文件。Uni 初始化的目录会按 target-files 清单生成并复用 APEX 密钥；手动密钥目录不会被修改。签名产物位于 `out/release/<产品名>/`。额外 APK 和 AVB 密钥需要按设备配置；参见 [Uni 签名说明](/docs/uni/#签名发布-ota)。

请在另一块存储设备上安全备份密钥目录。删除源码树不影响密钥；丢失密钥后，新生成的密钥无法直接延续原设备的常规 OTA 更新。

需要对已有 target-files 做隔离验证时：

```sh
uni --sign-keys ~/android-certs --sign-check
```
