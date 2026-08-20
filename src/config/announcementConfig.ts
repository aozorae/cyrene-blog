import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
	// 保留 Cyrene 的独立标题，避免上游默认文案覆盖个人站点标识
	title: "关于 Cyrene",

	// 公告内容
	content:
		"这里记录技术实践、站点迭代与日常片段。博客基于 Astro、Svelte 和 Tailwind CSS 构建，源码与更新过程均公开在 GitHub。",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "查看 GitHub 仓库",
		// 链接 URL
		url: "https://github.com/aozorae/cyrene-blog",
		// 内部链接
		external: true,
	},
};
