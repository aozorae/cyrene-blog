import type { SponsorConfig } from "../types/sponsorConfig";

export const sponsorConfig: SponsorConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// 打赏用途说明
	usage: "赞助方式尚未配置，这里暂时保留页面结构。",

	// 是否显示打赏者列表
	showSponsorsList: false,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否在文章详情页底部显示打赏按钮
	showButtonInPost: false,

	// 打赏方式列表
	methods: [
		{
			name: "赞助方式待补充",
			icon: "material-symbols:favorite-outline",
			qrCode: "",
			link: "",
			description: "后续配置完成后会在这里展示。",
			enabled: true,
		},
	],

	// 打赏者列表（可选）
	sponsors: [],
};
