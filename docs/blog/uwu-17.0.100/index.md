---
title: uwuAOSP 17.0.100
description: 更自由的桌面与外观设置，更细致的应用控制，以及面向设备维护者的新构建工具
aside: false
outline: false
---

<ReleaseBlog locale="zh-CN" mode="article" />

经过数月的移植与打磨，uwuAOSP 17.0.100 已进入可以构建和体验的阶段。它基于 AOSP `android-17.0.0_r1`，带回了许多 16.2 用户熟悉的功能，也加入了一些新的选择。这里挑出日常使用中能感受到的变化，以及设备维护者会用到的工具。

## 日常使用 {#daily-use}

主屏幕有了更完整的[一览区域](/docs/LauncherAtAGlance/)：日期、天气、闹钟、计时器和正在播放的音乐可以出现在同一处。需要不同布局时，Launcher 还提供网格、图标和搜索相关设置。部分桌面能力借鉴或移植自 Lawnchair；感谢 Lawnchair 社区的工作。

外观设置也更灵活。[自定义字体](/docs/CustomFonts/)可以导入单个字体，或从 ZIP 中挑选字体，先预览中文、英文、数字与日文，再决定是否应用到系统。恢复默认字体时，导入的字体文件也会清除。[系统小图标](/docs/SystemIcons/)则提供默认与 PUI 两种风格。PUI 资源来自天伞桜的作品，已整理为随系统源码编译的覆盖层。

连接 USB-C、HDMI 或受支持的虚拟显示器时，[外接屏桌面](/docs/ExternalDesktop/)可以调用 Android 的桌面模式，让应用在外接屏上以窗口运行。是否遮盖本机屏幕，以及是否允许 scrcpy 新建的虚拟屏进入桌面模式，都由用户决定。具体表现仍取决于设备的视频输出能力和应用的多窗口支持。

一些熟悉的细节也回来了：[智能建议](/docs/SmartSuggestions/)会按情境提供操作，[状态栏歌词](/docs/StatusBarLyric/)让正在播放的内容更容易看到。[单独控制应用音量](/docs/PerAppVolume/)则能在多个应用同时发声时分别调节它们的响度。

## 隐私与控制 {#privacy-and-control}

[应用剪贴板权限](/docs/ClipboardAccess/)提供按应用设置的读取和写入规则。用户可以选择允许、询问或拒绝；询问窗口也允许只处理当前请求，不必每次都保存永久规则。系统原有的输入法和受信任场景豁免仍然保留。

[应用传感器访问](/docs/AppSensorPolicy/)与[应用跳转控制](/docs/appjumpinjection/)继续提供更细的选择。[后台管理](/docs/uwuBackGroundManager/)帮助用户决定应用离开前台后的运行方式。每项功能的适用范围和限制都写在对应文档中。

## 给设备维护者 {#for-maintainers}

RinnRei 开发的 [Uni 构建工具](/docs/uni/)沿用 Soong、Kati 与 Ninja，重点减少重复分析构建图的时间，并把内核、长任务和主构建安排在合适的阶段。它会根据可用内存调整高内存任务的并发，构建中断后保留可复用产物，也提供完整日志供排查。构建速度取决于源码变化、设备配置和主机硬件；文档列有测试数据与计算方式。

我们也在推进 [Soong-only 构建流程](/docs/soong-only/)与 [uwu_kernel](/docs/soong-only/uwu_kernel/)，为设备树迁移和内核增量编译提供路径。现阶段仍有依赖需要手动处理；维护者可以按文档逐项验证。vendor 配置经过整理，设备维护者也可以在设备树中填写姓名，让系统更新页面显示维护信息。

## 感谢与参与 {#thanks-and-contributing}

感谢 AOSP、LineageOS、Lawnchair，以及所有上游项目和贡献者。感谢测试设备、提交问题和完善翻译的社区成员。uwuAOSP 的源码与文档都公开；如果发现问题，欢迎在 [Issue 页面](/issues/website/)记录复现过程，或通过 [GitHub](https://github.com/uwuAOSP) 提交修改。
