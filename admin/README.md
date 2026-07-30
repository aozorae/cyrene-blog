# Cyrene Admin Worker

该目录是博客仓库内的独立 Cloudflare Worker 管理后台。博客本身仍按仓库根目录的静态构建方式部署，不依赖本 Worker、D1 或管理 API。

## 工作方式

- GitHub 中的 Markdown、MDX 和配置文件是已发布内容的真实来源。
- D1 保存后台仓库设置、草稿、登录限流和审计记录。
- 后台将文章、动态和配置提交到 GitHub，静态托管平台检测提交后自动部署。
- 第一阶段不启用 R2、KV 或文件上传。

## 本地检查

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm check
```

本地开发需要在 `.dev.vars` 中设置 `ADMIN_PASSWORD`、`SESSION_SECRET` 和 `GITHUB_TOKEN`，该文件已被忽略，禁止提交。

## 自动部署

仓库中的 `.github/workflows/deploy-admin.yml` 负责创建或复用 D1、执行迁移、注入 Worker Secrets 并部署。需要配置以下 GitHub Repository Secrets：

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `BLOG_GITHUB_PAT`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

首次部署后，登录后台并在初始化界面选择要管理的 GitHub 仓库和分支。
