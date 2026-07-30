export const FIELD_GUIDE = {
	siteConfig: {
		label: "站点总配置",
		help: "控制站点外观、文章显示和页面功能的主要设置。",
	},
	profileConfig: {
		label: "个人资料配置",
		help: "控制侧边栏个人信息、头像和社交链接。",
	},
	navBarConfig: {
		label: "导航栏配置",
		help: "控制顶部导航菜单、搜索和快捷入口。",
	},
	sidebarConfig: {
		label: "侧边栏配置",
		help: "控制左右侧边栏与移动端组件的展示顺序。",
	},
	announcementConfig: {
		label: "公告配置",
		help: "控制首页或侧边栏公告的文字和链接。",
	},
	backgroundWallpaper: {
		label: "背景壁纸配置",
		help: "控制背景图片、视频、轮播和首页横幅。",
	},
	musicConfig: {
		label: "音乐播放器配置",
		help: "控制音乐来源、播放列表和播放器行为。",
	},
	commentConfig: {
		label: "评论系统配置",
		help: "选择并连接评论服务，例如 Twikoo、Waline 或 Giscus。",
	},
	analyticsConfig: {
		label: "统计分析配置",
		help: "连接访问统计、行为分析和回放服务。",
	},
	fontConfig: { label: "字体配置", help: "设置站点、横幅和代码使用的字体。" },
	coverImageConfig: {
		label: "文章封面配置",
		help: "控制文章封面与随机封面图片来源。",
	},
	dynamicConfig: {
		label: "动态页面配置",
		help: "控制动态页的标题、评论和每页数量。",
	},
	friendsConfig: {
		label: "友链配置",
		help: "设置友链页文案、排序和友链列表。",
	},
	galleryConfig: {
		label: "相册配置",
		help: "设置相册数据、展示顺序和卡片宽度。",
	},
	sponsorConfig: {
		label: "打赏配置",
		help: "设置打赏页文案、收款方式和赞助者列表。",
	},
	effectsConfig: { label: "特效配置", help: "控制樱花等页面视觉特效。" },
	expressiveCodeConfig: {
		label: "代码块配置",
		help: "控制代码高亮主题、折叠和语言标签。",
	},
	mermaidConfig: {
		label: "Mermaid 图表配置",
		help: "设置 Mermaid 图表在明暗模式下的主题。",
	},
	plantumlConfig: {
		label: "PlantUML 图表配置",
		help: "设置 PlantUML 服务地址、开关和主题。",
	},
	pioConfig: {
		label: "看板娘配置",
		help: "控制 Live2D 或 Spine 看板娘模型、菜单和提示语。",
	},
	footerConfig: { label: "页脚配置", help: "控制是否加载自定义页脚 HTML。" },
	licenseConfig: {
		label: "文章许可证配置",
		help: "设置文章底部展示的版权协议。",
	},
	content: { label: "内容", help: "填写将在页面中显示的正文或说明文字。" },
	title: { label: "标题", help: "显示在对应页面或组件上的主标题。" },
	subtitle: { label: "副标题", help: "显示在主标题附近的补充文字。" },
	description: {
		label: "说明文字",
		help: "用于向访客介绍当前页面、组件或内容。",
	},
	name: { label: "名称", help: "显示给访客看的名称。" },
	bio: { label: "个人签名", help: "显示在个人资料卡片中的简短介绍。" },
	avatar: { label: "头像地址", help: "个人头像图片的本地路径或可访问地址。" },
	url: { label: "链接地址", help: "点击后跳转到的页面或外部网址。" },
	site_url: {
		label: "站点网址",
		help: "博客的正式访问地址，用于 SEO、RSS 和分享链接。",
	},
	keywords: {
		label: "站点关键词",
		help: "帮助搜索引擎理解博客主题；每行填写一个关键词。",
	},
	enable: { label: "启用", help: "开启或关闭这一项功能。" },
	enabled: { label: "启用此项", help: "决定列表中的这一个项目是否显示。" },
	type: { label: "类型", help: "选择当前项目、服务或资源的类型。" },
	mode: { label: "模式", help: "选择此功能的工作方式。" },
	lang: { label: "语言", help: "设置组件界面使用的语言代码。" },
	locale: { label: "本地化语言", help: "设置服务界面显示的地区语言。" },
	icon: { label: "图标", help: "使用的图标名称，通常来自 Iconify 图标库。" },
	alt: {
		label: "替代文字",
		help: "图片无法显示时的说明，也有助于无障碍访问。",
	},
	link: { label: "跳转链接", help: "配置按钮或文字点击后打开的地址和方式。" },
	external: { label: "外部链接", help: "开启后会以外部页面方式打开此链接。" },
	text: { label: "按钮文字", help: "显示给访客看的链接或按钮文案。" },
	showName: { label: "显示名称", help: "是否在图标旁显示该链接的名称。" },
	links: {
		label: "社交链接",
		help: "个人资料卡片中展示的社交账号和站点入口。",
	},
	themeColor: { label: "主题色", help: "设置网站强调色及访客可否自行切换。" },
	hue: {
		label: "主题色色相",
		help: "0–360 的颜色数值；改变后会影响全站强调色。",
	},
	fixed: { label: "锁定主题色", help: "开启后访客不能在前台切换主题色。" },
	defaultMode: {
		label: "默认明暗模式",
		help: "选择默认亮色、暗色或跟随系统。",
	},
	pageWidth: {
		label: "页面宽度",
		help: "内容区域宽度，单位为 rem；数值越大页面越宽。",
	},
	card: { label: "卡片样式", help: "控制内容卡片的边框、阴影和主题色跟随。" },
	border: {
		label: "显示卡片边框",
		help: "开启后卡片会显示边框和阴影，层次更明显。",
	},
	followTheme: { label: "跟随主题色", help: "开启后该组件会使用当前主题色。" },
	favicon: {
		label: "网站图标",
		help: "浏览器标签页和收藏夹使用的网站图标列表。",
	},
	src: {
		label: "资源地址",
		help: "图片、音频、视频或其他资源的本地路径或网址。",
	},
	sizes: { label: "图标尺寸", help: "为不同设备声明图标尺寸，例如 32x32。" },
	navbar: {
		label: "导航栏外观",
		help: "设置导航栏 Logo、标题、对齐方式和固定行为。",
	},
	logo: { label: "Logo", help: "设置导航栏左侧显示的图标或图片。" },
	value: { label: "资源值", help: "填写对应类型使用的图标名或图片路径。" },
	widthFull: { label: "全宽导航栏", help: "开启后导航栏会占满整个屏幕宽度。" },
	menuAlign: { label: "菜单对齐方式", help: "控制导航菜单靠左或居中显示。" },
	stickyNavbar: {
		label: "固定顶部导航",
		help: "开启后滚动页面时导航栏仍保持在顶部。",
	},
	siteStartDate: { label: "建站日期", help: "用于计算站点已运行天数。" },
	timezone: { label: "站点时区", help: "用于格式化 RSS、番剧和日期时间。" },
	pages: {
		label: "页面开关",
		help: "关闭后对应页面会返回 404，并自动隐藏相关导航入口。",
	},
	friends: { label: "友链页面", help: "控制友链页面是否可访问。" },
	sponsor: { label: "打赏页面", help: "控制打赏页面是否可访问。" },
	guestbook: {
		label: "留言板页面",
		help: "控制留言板是否可访问；需要先配置评论系统。",
	},
	bangumi: { label: "番组计划", help: "控制番组计划页面及数据来源。" },
	gallery: { label: "相册页面", help: "控制相册页面是否可访问或相册数据。" },
	anime: { label: "追番页面", help: "控制追番页面是否可访问或追番数据。" },
	dynamic: {
		label: "动态页面",
		help: "控制动态页面是否可访问或侧边栏展示数量。",
	},
	categoryBar: {
		label: "分类快捷导航",
		help: "在首页和归档页顶部显示分类入口。",
	},
	foldArticle: {
		label: "折叠旧年份文章",
		help: "开启后归档页默认只展开最新年份。",
	},
	postListLayout: {
		label: "文章列表布局",
		help: "设置首页文章以列表或网格方式展示。",
	},
	mobileDefaultMode: {
		label: "移动端默认布局",
		help: "设置手机端文章列表的默认展示方式。",
	},
	allowSwitch: {
		label: "允许访客切换布局",
		help: "开启后访客可自行切换列表与网格布局。",
	},
	descriptionLines: {
		label: "摘要显示行数",
		help: "文章卡片中摘要最多显示的行数；0 表示不截断。",
	},
	showStatsIcons: {
		label: "显示统计图标",
		help: "在文章卡片底部的日期和统计信息前显示图标。",
	},
	tagsPosition: {
		label: "标签显示位置",
		help: "选择标签显示在标题下方还是卡片底部。",
	},
	meta: { label: "文章元信息", help: "控制标题下方显示哪些文章信息。" },
	stats: { label: "底部统计信息", help: "控制文章卡片底部显示哪些统计内容。" },
	showPublished: {
		label: "显示发布日期",
		help: "是否显示文章或内容的发布时间。",
	},
	showCategory: { label: "显示分类", help: "是否显示文章所属分类。" },
	showTags: { label: "显示标签", help: "是否显示文章标签。" },
	tagCount: {
		label: "标签数量上限",
		help: "单篇文章最多展示多少个标签；0 表示不限制。",
	},
	showWords: { label: "显示字数", help: "是否显示文章字数统计。" },
	showReadingTime: { label: "显示阅读时长", help: "是否显示预计阅读时间。" },
	grid: { label: "网格布局", help: "设置网格文章卡片的排列方式和最小宽度。" },
	masonry: { label: "瀑布流布局", help: "开启后网格卡片会按高度错落排列。" },
	columnWidth: {
		label: "卡片最小宽度",
		help: "网格卡片的最小宽度，单位为像素。",
	},
	post: {
		label: "文章内容页",
		help: "设置文章正文页面的提醒框、更新时间和分享功能。",
	},
	rehypeCallouts: {
		label: "提示框样式",
		help: "设置 Markdown 提醒框（Admonition）的主题和语法兼容性。",
	},
	showLastModified: {
		label: "显示最近编辑时间",
		help: "在文章页底部展示最近编辑时间卡片。",
	},
	outdatedThreshold: {
		label: "过期提醒天数",
		help: "文章超过此天数未更新时才显示编辑时间提醒。",
	},
	sharePoster: {
		label: "生成分享海报",
		help: "开启后可为文章生成用于分享的海报图片。",
	},
	generateOgImages: {
		label: "生成 OpenGraph 图片",
		help: "为社交分享生成预览图；会显著增加构建时间。",
	},
	userId: { label: "用户 ID", help: "第三方服务中用于读取数据的用户标识。" },
	apiUrl: { label: "API 地址", help: "用于请求数据的服务接口地址。" },
	subjectBaseUrl: { label: "条目详情地址", help: "番组条目详情页的基础网址。" },
	categoryOrder: {
		label: "分类展示顺序",
		help: "按数组顺序优先展示番组分类。",
	},
	bilibili: {
		label: "哔哩哔哩设置",
		help: "填写用于读取追番数据的哔哩哔哩账号信息。",
	},
	uid: { label: "哔哩哔哩 UID", help: "你的哔哩哔哩用户数字 ID。" },
	pagination: { label: "分页设置", help: "控制列表每页显示的内容数量。" },
	postsPerPage: {
		label: "每页文章数",
		help: "归档和文章列表每一页显示的文章数量。",
	},
	imageOptimization: {
		label: "图片优化",
		help: "控制构建时图片格式、压缩质量和防盗链策略。",
	},
	formats: {
		label: "输出图片格式",
		help: "选择 WebP、AVIF 或同时输出两种格式。",
	},
	quality: {
		label: "图片压缩质量",
		help: "范围 1–100；数值越低体积越小、画质越低。",
	},
	noReferrerDomains: {
		label: "禁用来源信息的域名",
		help: "为这些域名的图片加 no-referrer，常用于解决防盗链 403。",
	},
	closable: { label: "允许关闭", help: "开启后访客可以在前台关闭该组件。" },
	switchable: {
		label: "允许切换",
		help: "开启后访客可以在前台切换此效果或背景。",
	},
	showInNavbar: {
		label: "在导航栏显示",
		help: "是否在顶部导航栏显示此功能入口。",
	},
	showInSidebar: { label: "在侧边栏显示", help: "是否在侧边栏显示此组件。" },
	volume: { label: "默认音量", help: "播放器初始音量，范围通常为 0 到 1。" },
	playMode: { label: "播放模式", help: "设置顺序播放、随机播放或单曲循环。" },
	showLyrics: { label: "显示歌词", help: "开启后播放器会显示歌曲歌词。" },
	playlist: { label: "播放列表", help: "本地音乐模式下要播放的歌曲列表。" },
	artist: { label: "歌手", help: "歌曲演唱者或创作者名称。" },
	cover: { label: "封面图片", help: "歌曲或内容卡片使用的封面图片地址。" },
	lrc: { label: "歌词文件", help: "歌词文本或 LRC 歌词文件地址。" },
	serverURL: { label: "服务端地址", help: "评论服务的部署地址。" },
	repo: {
		label: "GitHub 仓库",
		help: "Giscus 使用的 GitHub 仓库，格式为 所有者/仓库名。",
	},
	repoId: { label: "仓库 ID", help: "Giscus 使用的 GitHub 仓库内部 ID。" },
	category: {
		label: "讨论分类",
		help: "Giscus 将评论保存到的 GitHub Discussions 分类。",
	},
	categoryId: {
		label: "分类 ID",
		help: "Giscus 使用的 Discussions 分类内部 ID。",
	},
	mapping: { label: "评论映射方式", help: "决定文章如何对应到一条讨论。" },
	visitorCount: { label: "访客统计", help: "开启后评论服务会提供访问量统计。" },
	googleAnalyticsId: {
		label: "Google Analytics ID",
		help: "Google Analytics 的网站衡量 ID。",
	},
	microsoftClarityId: {
		label: "Microsoft Clarity ID",
		help: "Microsoft Clarity 的项目 ID。",
	},
	umamiAnalytics: {
		label: "Umami 统计",
		help: "Umami 访问统计与会话回放的连接设置。",
	},
	websiteId: { label: "网站 ID", help: "统计服务分配给当前站点的唯一 ID。" },
	scriptUrl: {
		label: "脚本地址",
		help: "加载第三方服务所需的 JavaScript 地址。",
	},
	trackOutboundLinks: {
		label: "统计外链点击",
		help: "开启后记录访客点击站外链接的行为。",
	},
	collectWebVitals: {
		label: "收集网页性能指标",
		help: "开启后记录页面加载与交互性能数据。",
	},
	replays: { label: "会话回放", help: "控制访客会话录制与回放功能。" },
	sampleRate: {
		label: "采样比例",
		help: "录制会话的比例；0.15 表示约 15% 的访问。",
	},
	maskLevel: {
		label: "隐私遮罩级别",
		help: "控制会话回放中访客内容的遮罩程度。",
	},
	maxDuration: {
		label: "最长录制时长",
		help: "单次会话回放最长保留时间，单位为毫秒。",
	},
	randomCoverImage: {
		label: "随机封面",
		help: "从配置的图片 API 为文章随机选择封面。",
	},
	apis: {
		label: "图片 API 列表",
		help: "可用于获取随机封面的接口地址；每行一个。",
	},
	fallback: { label: "备用封面", help: "随机封面获取失败时使用的默认图片。" },
	showLoading: {
		label: "显示加载状态",
		help: "获取随机封面时是否显示加载提示。",
	},
	itemsPerPage: { label: "每页动态数", help: "动态页面每一页显示的内容数量。" },
	showComment: { label: "显示评论区", help: "是否在当前页面显示评论区。" },
	showSponsorsList: {
		label: "显示赞助者列表",
		help: "是否在打赏页展示已登记的赞助者。",
	},
	showButtonInPost: {
		label: "文章中显示打赏按钮",
		help: "是否在文章正文底部显示前往打赏页的入口。",
	},
	methods: { label: "打赏方式", help: "可使用的二维码或外部收款链接列表。" },
	qrCode: { label: "收款二维码", help: "二维码图片的本地路径或可访问网址。" },
	sponsors: { label: "赞助者列表", help: "在打赏页公开展示的赞助记录。" },
	amount: { label: "赞助金额", help: "公开展示的赞助金额。" },
	date: { label: "日期", help: "内容、相册或赞助记录对应的日期。" },
	showCustomContent: {
		label: "显示自定义内容",
		help: "是否展示友链页的自定义说明内容。",
	},
	randomizeSort: {
		label: "随机排序",
		help: "每次加载友链页时随机调整友链顺序。",
	},
	tags: { label: "标签", help: "用于归类或筛选内容的标签；每行一个。" },
	weight: { label: "排序权重", help: "数值越大越靠前，用于控制列表排序。" },
	albums: {
		label: "相册列表",
		help: "逐项管理相册名称、图片目录、日期和访问限制。",
	},
	location: { label: "拍摄地点", help: "相册或照片拍摄、创作的地点。" },
	password: { label: "访问密码", help: "为该相册设置访问密码；留空则不加密。" },
	passwordHint: {
		label: "密码提示",
		help: "帮助访客回忆相册访问密码的提示文字。",
	},
	darkTheme: { label: "暗色主题", help: "网站处于暗色模式时使用的主题名称。" },
	lightTheme: { label: "亮色主题", help: "网站处于亮色模式时使用的主题名称。" },
	pluginCollapsible: { label: "代码折叠", help: "设置长代码块的折叠行为。" },
	lineThreshold: {
		label: "折叠行数阈值",
		help: "代码超过此行数时显示折叠按钮。",
	},
	previewLines: {
		label: "折叠预览行数",
		help: "代码折叠时仍保留显示的前几行。",
	},
	defaultCollapsed: {
		label: "默认折叠",
		help: "开启后长代码块初始状态为折叠。",
	},
	pluginLanguageBadge: {
		label: "语言标签",
		help: "是否在代码块上显示编程语言标签。",
	},
	server: { label: "服务地址", help: "PlantUML 或其他服务的请求地址。" },
	playerEnable: {
		label: "启用背景播放器",
		help: "开启后允许使用视频或动态背景播放器。",
	},
	desktop: { label: "桌面端资源", help: "只在桌面设备使用的背景或视觉资源。" },
	mobile: { label: "移动端资源", help: "只在手机设备使用的背景或视觉资源。" },
	dimOpacity: {
		label: "背景遮罩透明度",
		help: "背景变暗遮罩的强度，数值越大背景越暗。",
	},
	interval: { label: "轮播间隔", help: "自动切换的时间间隔，单位为毫秒。" },
	transitionEffect: {
		label: "切换动画",
		help: "背景或轮播图切换时使用的过渡效果。",
	},
	opacity: { label: "透明度", help: "组件或视觉效果的透明程度。" },
	blur: { label: "模糊程度", help: "背景或组件应用的模糊强度。" },
	position: { label: "位置", help: "组件、背景图或菜单在页面中的显示位置。" },
	model: { label: "模型设置", help: "看板娘模型文件与显示位置的设置。" },
	scale: { label: "缩放比例", help: "模型显示大小的倍数。" },
	responsive: { label: "响应式设置", help: "控制不同屏幕尺寸下的显示行为。" },
	hideOnMobile: {
		label: "手机端隐藏",
		help: "开启后在手机等小屏设备不显示该组件。",
	},
	mobileBreakpoint: {
		label: "手机端断点",
		help: "屏幕宽度低于此像素值时视为手机端。",
	},
	zIndex: { label: "显示层级", help: "数值越大越显示在其他元素上方。" },
	license: { label: "许可证", help: "设置文章采用的版权协议及跳转地址。" },
};


export function fieldInfo(path) {
	const key = path.split(".").at(-1) || path;
	return (
		FIELD_GUIDE[path] ||
		FIELD_GUIDE[key] || {
			label: key,
			help: `高级配置参数“${key}”。请保留此名称以便与主题配置核对。`,
		}
	);
}
