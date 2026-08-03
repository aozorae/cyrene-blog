# 关于我 / About Me

你好，我是 GitHub 用户 **[aozorae](https://github.com/aozorae)**。这里是围绕 **昔涟 / Cyrene** 持续建设的个人博客。

> “下一页是空白呢，那我们一起写下吧？”

## 关于本站

本站用于记录 Web 开发实践、项目迭代与日常内容。文章、动态和网站配置都以 GitHub 仓库为真源，每一次公开更新都可以在提交历史中找到。

- GitHub 主页：[github.com/aozorae](https://github.com/aozorae)
- 项目源码：[aozorae/cyrene-blog](https://github.com/aozorae/cyrene-blog)
- 在线站点：[cyrene-blog.vercel.app](https://cyrene-blog.vercel.app)

::github{repo="aozorae/cyrene-blog"}

## 技术栈

### 博客前端

- **Astro 7**：负责静态页面生成、内容集合、Markdown/MDX 与构建优化。
- **Svelte 5**：承载播放器、搜索、主题切换等需要客户端状态的交互组件。
- **Tailwind CSS 4**：管理响应式布局、明暗主题和组件样式。
- **TypeScript**：约束配置、内容数据与组件接口，减少配置迭代中的回归。
- **Pagefind**：在构建阶段生成静态搜索索引，无需额外搜索服务。

### 管理后台与内容发布

- **Cloudflare Workers**：运行独立的博客管理后台与 API。
- **Cloudflare D1**：保存后台草稿、登录限流与审计记录，不作为文章内容数据库。
- **GitHub API**：后台将文章、动态和配置提交回仓库，GitHub 始终是已发布内容的唯一真源。
- **Vditor**：为文章和动态提供 Markdown 编辑与预览能力。

### 部署链路

- 博客前端由 **Vercel** 构建并发布。
- 管理后台通过 **GitHub Actions** 部署到 **Cloudflare Workers**。
- 配置或内容提交到 GitHub 后，由对应平台自动触发新的生产构建。

项目仍在持续完善。欢迎通过 [GitHub Issues](https://github.com/aozorae/cyrene-blog/issues) 反馈问题或交流实现细节。
