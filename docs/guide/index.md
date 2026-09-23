# 快速开始

## 构建uwuAOSP

本页内容适合您发现没有对应您机型的 OTA 包或者想要自行开发的情形。

16.2：您需要手动 bringup（也就是将您的 lineage 设备树适配到 uwuAOSP 上）。这只是很简单的 lineage_ -> custom_ 改名。

17.0：请使用 uwuCLI 转换您的设备树。如有问题，请向 [uwuCLI](https://github.com/UwUniverse/uwuCLI) 提出 Issue。

## 签名发布 OTA

Uni 可以在生成 target-files 后直接产出签名 OTA。密钥目录需要包含以下四组密钥：

```text
releasekey.pk8       releasekey.x509.pem
platform.pk8         platform.x509.pem
shared.pk8           shared.x509.pem
media.pk8            media.x509.pem
```

完成 `lunch` 后执行：

```sh
uni -j$(nproc) otapackage --sign-keys ~/android-certs
```

Uni 会构建 `target-files-package` 和 `otatools`，签名 APK/APEX 与 OTA，并写出 SHA-256 校验文件。签名产物位于 `out/release/<产品名>/`。密钥只在签名阶段读取，不会写入源码树或普通编译产物。

需要对已有 target-files 做隔离验证时：

```sh
uni --sign-keys ~/android-certs --sign-check
```
