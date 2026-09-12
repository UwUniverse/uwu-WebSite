# Clipboard app suggestions

After a matching link or text is copied, the system clipboard overlay shows an action
button for the target app. Tap the button to try opening the matching content in that app.

## Enable and configure

Go to **uwuSettingsExt → Intelligence → Smart suggestions** and enable clipboard app
suggestions.

On the rules page you can:

- Enable or disable an individual rule.
- Add and edit custom rules.
- Delete rules.
- Restore the default rules.

Default rules cover apps such as Taobao, Baidu Netdisk, 123 Cloud Disk, Bilibili, Douyin,
Pinduoduo, JD, Xiaohongshu, Weibo, Zhihu, NetEase Cloud Music, QQ Music, Xianyu, Alipay,
DingTalk, Quark, and Feishu.

## Use

1. Copy a link or text in any app.
2. When the content matches an enabled rule, the clipboard overlay shows the target-app button.
3. Tap the button to open the matching content in the target app.

If the target app cannot process the matching content directly, the system may open the
app home page instead. The overlay usually disappears after about 6 seconds; interaction
with it recalculates the display time.

## Scope

- The target app must be installed, enabled, and launchable.
- When multiple rules match, only the first valid suggestion is shown.
- Copying content from the target app itself does not suggest opening the same app again.
- Links primarily support HTTP, HTTPS, `dtk://`, and `m.tb.cn`; other matching content may only open the app home page.
- Invalid rules are ignored without affecting other valid rules.
