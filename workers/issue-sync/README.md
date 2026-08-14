# uwuAOSP issue Worker

这个 Worker 从 `uwuAOSP/issue_tracker` 同步 GitHub issue 和评论到 D1，同时提供 WebSite-issue、账户登录和 GitHub webhook 接口。

## 首次部署

```powershell
npx wrangler d1 migrations apply ISSUE_DB --remote --config workers/issue-sync/wrangler.toml
npx wrangler deploy --config workers/issue-sync/wrangler.toml
```

D1 数据库名称是 `uwuaosp-issue`，ID 是 `ea7bdb45-e46f-4c05-b8a2-c0554ad49364`。

## Secret

GitHub 仓库 webhook 选择 `issues` 和 `issue_comment`，Payload URL 为：

```text
https://<worker-domain>/webhooks/github
```

Webhook Secret 必须保存为 Cloudflare Worker Secret：

```powershell
npx wrangler secret put GITHUB_WEBHOOK_SECRET --config workers/issue-sync/wrangler.toml
```

可选 Secret：

```powershell
npx wrangler secret put GITHUB_TOKEN --config workers/issue-sync/wrangler.toml
npx wrangler secret put SYNC_TOKEN --config workers/issue-sync/wrangler.toml
```

`GITHUB_TOKEN` 用于提高 API 限额，`SYNC_TOKEN` 保护手动同步接口。

## API

```text
GET   /api/health
GET   /api/auth/me
POST  /api/auth/register
POST  /api/auth/login
POST  /api/auth/logout
GET   /api/website-issues
GET   /api/website-issues/:id
POST  /api/website-issues
PATCH /api/website-issues/:id
POST  /api/website-issues/:id/close
POST  /api/website-issues/:id/reopen
PATCH /api/website-issues/:id/status
POST  /api/website-issues/:id/comments
GET   /api/github-issues
GET   /api/github-issues/:number
GET   /api/sync-status
POST  /api/sync
POST  /webhooks/github
```

WebSite-issue 的新增和修改要求登录。普通用户只能修改、关闭和重新打开自己发送的 issue。管理员可以修改全部 issue，并切换 `open`、`in_progress`、`closed` 和 `invalid` 状态。详情接口会返回发送者用户名和邮箱，供 Issue 页面展开显示。

`RinnRei`、`uwugl` 和 `likw233` 是保留管理员用户名，禁止再次注册。已存在的同名账户会在迁移时提升为管理员。

Cron 是 `7 18 * * *`，对应北京时间每天 02:07。Webhook 到达后会即时更新 GitHub issue 的状态，不等待 Cron。

## 本地测试

```powershell
npx wrangler d1 migrations apply ISSUE_DB --local --config workers/issue-sync/wrangler.toml
npx wrangler dev --config workers/issue-sync/wrangler.toml
```

网站本地开发时设置：

```powershell
$env:VITE_ISSUES_API = 'http://127.0.0.1:8787'
pnpm run docs:dev
```

GitHub Pages 构建需要在仓库 `Settings → Secrets and variables → Actions → Variables` 添加 `VITE_ISSUES_API`，值为 Worker 根地址，例如 `https://<worker-domain>`。`WEB_ORIGINS` 也要包含实际 Pages 或自定义域名的 origin。
