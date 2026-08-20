# 个人博客分支

## 本地边界

- 开源示例：`C:\Users\temp\code\cyrene-blog`，分支 `master`。
- 个人博客：`C:\Users\temp\code\cyrene-blog-personal`，分支 `personal-blog`。
- 两个目录是同一 Git 仓库的独立 worktree。文件、构建产物和本地环境变量互不共用，但提交历史可以正常合并。

不要在开源示例目录中运行个人后台的初始化、迁移或部署命令。个人后台固定使用：

- Worker：`cyrene-personal-admin`
- D1：`cyrene-personal-admin-db`
- GitHub Environment：`personal-blog`

## 同步开源示例更新

先更新示例分支：

```bash
cd /c/Users/temp/code/cyrene-blog
git pull --ff-only origin master
```

再把示例代码合并到个人博客：

```bash
cd /c/Users/temp/code/cyrene-blog-personal
git fetch origin
git merge origin/master
```

个人文章、动态和配置都保存在 `personal-blog` 分支。合并 `master` 时若同一文件两边都修改过，需要按个人博客内容解决冲突，不能用示例配置覆盖个人数据。

## 后台部署配置

后台工作流为 `.github/workflows/deploy-personal-admin.yml`，只会从 `personal-blog` 分支部署，并且不会复用示例后台的 Worker 或 D1。

个人分支的 `admin/wrangler.jsonc` 也固定绑定上述 Worker 和 D1，因此在个人目录运行本地 Wrangler 命令时不会指向示例后台。不要把这份资源配置复制回 `master`。

在 GitHub 仓库中创建名为 `personal-blog` 的 Environment，然后填写以下 secrets：

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `PERSONAL_BLOG_GITHUB_PAT`
- `PERSONAL_ADMIN_PASSWORD`
- `PERSONAL_SESSION_SECRET`

其中 `PERSONAL_BLOG_GITHUB_PAT` 由博客所有者自行申请和填写。Token 需要对 `aozorae/cyrene-blog` 仓库具有 Contents 读写权限，后台初始化时选择 `personal-blog` 分支。

上述 secrets 全部填写完成后，在仓库级 Actions variables 中设置 `PERSONAL_ADMIN_DEPLOY_ENABLED=true`。启用前，个人分支的 push 只会跳过部署 job，不会因为缺少 GitHub Token 而产生失败部署；启用后，`admin/**` 或个人后台工作流发生变化时会自动更新独立 Worker。

资源名可保持默认值。如需修改，只在该 Environment 中设置：

- `PERSONAL_ADMIN_WORKER_NAME`
- `PERSONAL_ADMIN_D1_NAME`

前端不包含自动部署配置，由博客所有者从 `personal-blog` 分支自行连接 Vercel 或其他静态托管平台。
