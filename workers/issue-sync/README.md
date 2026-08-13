# uwuAOSP Issue Sync Worker

这个 Worker 从 uwuAOSP/issue_tracker 同步全部 Issue 和评论到 D1。

## 数据库

数据库绑定名称是 ISSUE_DB：

- 数据库名称：uwuaosp-issue
- 数据库 ID：ea7bdb45-e46f-4c05-b8a2-c0554ad49364

首次部署前执行迁移：

~~~powershell
npx wrangler d1 migrations apply ISSUE_DB --remote --config workers/issue-sync/wrangler.toml
~~~

## 部署

~~~powershell
npx wrangler deploy --config workers/issue-sync/wrangler.toml
~~~

Worker 的 Cron 是 7 18 * * *，对应北京时间每天凌晨 02:07。

Worker 运行时可选配置：

- GITHUB_TOKEN：提高 GitHub API 限额，使用 Cloudflare Secret 保存
- SYNC_TOKEN：保护 POST /api/sync 手动同步接口，使用 Cloudflare Secret 保存

~~~powershell
npx wrangler secret put GITHUB_TOKEN --config workers/issue-sync/wrangler.toml
npx wrangler secret put SYNC_TOKEN --config workers/issue-sync/wrangler.toml
~~~

## 接口

~~~text
GET  /api/health
GET  /api/issues?limit=50&offset=0
GET  /api/issues/:number
GET  /api/sync-status
POST /api/sync
~~~

手动同步需要请求头：

~~~text
Authorization: Bearer <SYNC_TOKEN>
~~~

## 本地测试

~~~powershell
npx wrangler dev --config workers/issue-sync/wrangler.toml
curl "http://localhost:8787/cdn-cgi/handler/scheduled?format=json"
~~~
