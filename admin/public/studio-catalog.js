export const STUDIO_GROUPS = [
	{
		id: "foundation",
		label: "基础配置",
		eyebrow: "FOUNDATION",
		description: "管理站点身份、个人资料、公告和背景壁纸。",
		icon: "settings-2",
		items: [
			{ path: "src/config/siteConfig.ts", label: "站点配置" },
			{ path: "src/config/profileConfig.ts", label: "个人资料" },
			{ path: "src/config/announcementConfig.ts", label: "公告" },
			{ path: "src/config/backgroundWallpaper.ts", label: "背景壁纸" },
		],
	},
	{
		id: "components",
		label: "基础组件",
		eyebrow: "COMPONENTS",
		description: "管理导航栏、侧边栏和侧边栏中的各类组件。",
		icon: "panels-top-left",
		items: [
			{ path: "src/config/navBarConfig.ts", label: "导航栏" },
			{ path: "src/config/sidebarConfig.ts", label: "侧边栏与组件" },
		],
	},
	{
		id: "features",
		label: "功能配置",
		eyebrow: "FEATURES",
		description: "管理内容展示、评论统计、音乐和图表渲染等功能。",
		icon: "sliders-horizontal",
		items: [
			{ path: "src/config/fontConfig.ts", label: "字体" },
			{ path: "src/config/expressiveCodeConfig.ts", label: "代码块" },
			{ path: "src/config/coverImageConfig.ts", label: "文章封面" },
			{ path: "src/config/musicConfig.ts", label: "音乐播放器" },
			{ path: "src/config/commentConfig.ts", label: "评论系统" },
			{ path: "src/config/analyticsConfig.ts", label: "统计分析" },
			{ path: "src/config/mermaidConfig.ts", label: "Mermaid 图表" },
			{ path: "src/config/plantumlConfig.ts", label: "PlantUML 图表" },
		],
	},
	{
		id: "pages",
		label: "页面",
		eyebrow: "PAGES",
		description: "管理动态、友链、相册和打赏等独立页面。",
		icon: "files",
		items: [
			{ path: "src/config/dynamicConfig.ts", label: "动态" },
			{ path: "src/config/friendsConfig.ts", label: "友链" },
			{ path: "src/config/galleryConfig.ts", label: "相册" },
			{ path: "src/config/sponsorConfig.ts", label: "打赏" },
		],
	},
	{
		id: "extensions",
		label: "拓展功能",
		eyebrow: "EXTENSIONS",
		description: "管理特效、页脚、许可证和看板娘模型。",
		icon: "puzzle",
		items: [
			{ path: "src/config/effectsConfig.ts", label: "特效" },
			{ path: "src/config/footerConfig.ts", label: "页脚" },
			{ path: "src/config/FooterConfig.html", label: "页脚 HTML" },
			{ path: "src/config/licenseConfig.ts", label: "许可证" },
			{ path: "src/config/pioConfig.ts", label: "看板娘模型" },
		],
	},
];

export function findStudioGroup(groupId) {
	return (
		STUDIO_GROUPS.find((group) => group.id === groupId) || STUDIO_GROUPS[0]
	);
}

export function findStudioGroupByPath(path) {
	return (
		STUDIO_GROUPS.find((group) =>
			group.items.some((item) => item.path === path),
		) || STUDIO_GROUPS[0]
	);
}
