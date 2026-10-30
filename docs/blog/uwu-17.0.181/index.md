---
title: uwuAOSP 17.0.181
description: uwuAOSP 17.0.181
aside: false
outline: false
changelogBranch: uwu-17.0.181
---

<ReleaseBlog locale="zh-CN" mode="article" release="uwu-17.0.181" />

- 剪贴板拦截现在会暂时保留信息，您无需在授权后重新发起剪贴板写入申请。
- 大幅优化分离式 QS 的动画
- 为开机动画添加 part2
- 重构传感器、剪贴板、应用跳转设置：
  您现在可以在各个 App 的关于页面中通过“权限”入口直接调整权限，无需再进入 uwuSettingsExt 进行切换
- 修复双击状态栏熄屏功能
- 重命名 ParanoidSense 的编译 Flag, 现在，如果您需要使用设备 HAL 提供的人脸识别，请指定:
TARGET_USES_NATIVE_FACEUNLOCK := true
- 添加全新系统更新器
- 重写 uwuCompose 组件库
- 重绘 Catshare 图标
- 修复自定义图标包的图标显示问题
- 合并 2026 年 9 月和 10 月安全更新，增强系统安全性
- 更新 Go prebuilt 到 1.26.10, 提升编译性能
- 重写内存分配，加上 Go 1.26.10 默认开启的 Green Tea GC, 源码缓存刷新与指纹计算约快 15%，累计内存分配减少 27%
- 提升 iconloaderlib 自动识别图标的能力
