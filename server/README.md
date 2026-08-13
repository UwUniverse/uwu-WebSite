# Issue Webhook 示例

这个示例包含两个接口：

- `GET /api/issues`：网站读取 Issue 列表。
- `POST /webhooks/github`：GitHub 推送 `issues` 或 `issue_comment` 事件。

当前示例默认只接收 `uwuAOSP/issue_tracker` 的事件。

启动：

```powershell
$env:WEBHOOK_SECRET = '替换成你的 Webhook Secret'
pnpm run issues:server
```

然后在另一个终端启动网站。为了让本地页面连接示例 API：

```powershell
$env:VITE_ISSUES_API = 'http://127.0.0.1:8787/api/issues'
pnpm run docs:dev
```

访问 `http://localhost:5173/issues/`。

GitHub Webhook 配置：

- Payload URL：部署后的 `/webhooks/github` 地址
- Content type：`application/json`
- Secret：与 `WEBHOOK_SECRET` 相同
- Events：`Issues`；需要评论时再选择 `Issue comments`

当前本地示例默认使用 `server/data/issues.json` 中的演示数据。部署时必须设置真实 Secret，并将 `data/issues.json` 换成数据库或持久化存储。
