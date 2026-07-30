const choice = (value, label) => ({ value, label });

const DOCUMENTATION_BASE_URL = "https://cyrene-docs.vercel.app";
const docsGuide = (path) => `${DOCUMENTATION_BASE_URL}${path}`;

const DOCUMENT_GUIDES = {
	"src/config/siteConfig.ts": docsGuide("/guide/config-foundation#site-config"),
	"src/config/profileConfig.ts": docsGuide("/guide/config-foundation#profile"),
	"src/config/announcementConfig.ts": docsGuide(
		"/guide/config-foundation#announcement",
	),
	"src/config/backgroundWallpaper.ts": docsGuide(
		"/guide/config-foundation#background-wallpaper",
	),
	"src/config/navBarConfig.ts": docsGuide("/guide/config-components#navbar"),
	"src/config/sidebarConfig.ts": docsGuide("/guide/config-components#sidebar"),
	"src/config/fontConfig.ts": docsGuide("/guide/config-features#font"),
	"src/config/expressiveCodeConfig.ts": docsGuide(
		"/guide/config-features#code-block",
	),
	"src/config/coverImageConfig.ts": docsGuide(
		"/guide/config-features#cover-image",
	),
	"src/config/musicConfig.ts": docsGuide("/guide/config-features#music-player"),
	"src/config/commentConfig.ts": docsGuide("/guide/config-features#comments"),
	"src/config/analyticsConfig.ts": docsGuide("/guide/config-features#analytics"),
	"src/config/mermaidConfig.ts": docsGuide("/guide/config-features#mermaid"),
	"src/config/plantumlConfig.ts": docsGuide("/guide/config-features#plantuml"),
	"src/config/dynamicConfig.ts": docsGuide("/guide/config-pages#dynamic"),
	"src/config/friendsConfig.ts": docsGuide("/guide/config-pages#friends"),
	"src/config/galleryConfig.ts": docsGuide("/guide/config-pages#gallery"),
	"src/config/sponsorConfig.ts": docsGuide("/guide/config-pages#sponsor"),
	"src/config/effectsConfig.ts": docsGuide("/guide/config-extensions#effects"),
	"src/config/footerConfig.ts": docsGuide("/guide/config-extensions#footer"),
	"src/config/FooterConfig.html": docsGuide("/guide/config-extensions#footer-html"),
	"src/config/licenseConfig.ts": docsGuide("/guide/config-extensions#license"),
	"src/config/pioConfig.ts": docsGuide("/guide/config-extensions#mascot"),
};

const PATH_SCHEMAS = {
	"siteConfig.themeColor.hue": {
		min: 0,
		max: 360,
		step: 1,
		unit: "°",
		visual: "hue",
	},
	"siteConfig.themeColor.defaultMode": {
		options: [
			choice("light", "亮色"),
			choice("dark", "暗色"),
			choice("system", "跟随系统"),
		],
	},
	"siteConfig.navbar.logo.type": {
		options: [
			choice("icon", "Iconify 图标"),
			choice("image", "本地图片"),
			choice("url", "网络图片"),
		],
	},
	"siteConfig.navbar.menuAlign": {
		options: [choice("left", "左对齐"), choice("center", "居中")],
	},
	"siteConfig.postListLayout.defaultMode": {
		options: [choice("list", "列表"), choice("grid", "网格")],
	},
	"siteConfig.postListLayout.mobileDefaultMode": {
		options: [choice("list", "列表"), choice("grid", "网格")],
	},
	"siteConfig.postListLayout.tagsPosition": {
		options: [choice("meta", "标题下方"), choice("bottom", "卡片底部")],
	},
	"siteConfig.post.rehypeCallouts.theme": {
		options: [
			choice("github", "GitHub"),
			choice("obsidian", "Obsidian"),
			choice("vitepress", "VitePress"),
			choice("docusaurus", "Docusaurus"),
		],
	},
	"siteConfig.bangumi.mode": {
		options: [
			choice("static", "构建时获取"),
			choice("dynamic", "浏览器实时获取"),
		],
	},
	"siteConfig.bangumi.categoryOrder[]": {
		options: [
			choice("anime", "动画"),
			choice("book", "书籍"),
			choice("music", "音乐"),
			choice("game", "游戏"),
			choice("real", "三次元"),
		],
	},
	"siteConfig.imageOptimization.formats": {
		options: [
			choice("webp", "仅 WebP"),
			choice("avif", "仅 AVIF"),
			choice("both", "同时输出"),
		],
	},
	"siteConfig.lang": {
		readonly: true,
		help: "当前值由配置文件顶部的 SITE_LANG 常量提供。为避免改变原文件写法，此处只展示不直接改写。",
	},
	"navBarSearchConfig.method": {
		readonly: true,
		label: "搜索方式",
		help: "当前主题只实现 Pagefind 搜索，保持现有枚举表达式不变。",
	},
	"sidebarLayoutConfig.position": {
		options: [
			choice("left", "仅左侧"),
			choice("right", "仅右侧"),
			choice("both", "双侧栏"),
		],
	},
	"sidebarLayoutConfig.tabletSidebar": {
		options: [choice("left", "显示左侧"), choice("right", "显示右侧")],
	},
	"sidebarLayoutConfig.leftComponents[].type": {
		options: sidebarComponentChoices(),
	},
	"sidebarLayoutConfig.rightComponents[].type": {
		options: sidebarComponentChoices(),
	},
	"sidebarLayoutConfig.mobileBottomComponents[].type": {
		options: sidebarComponentChoices(),
	},
	"sidebarLayoutConfig.leftComponents[].position": {
		options: componentPositionChoices(),
	},
	"sidebarLayoutConfig.rightComponents[].position": {
		options: componentPositionChoices(),
	},
	"backgroundWallpaper.mode": {
		options: [
			choice("banner", "横幅壁纸"),
			choice("fullscreen", "全屏壁纸"),
			choice("overlay", "透明覆盖"),
			choice("none", "纯色背景"),
		],
	},
	"backgroundWallpaper.common.playerMode": {
		options: [choice("order", "顺序循环"), choice("random", "随机播放")],
	},
	"backgroundWallpaper.common.postInfo.mode": {
		options: [
			choice("description", "显示文章摘要"),
			choice("meta", "显示文章信息"),
		],
	},
	"backgroundWallpaper.common.navbar.transparentMode": {
		options: [
			choice("semi", "半透明"),
			choice("full", "完全透明"),
			choice("semifull", "动态透明"),
		],
	},
	"backgroundWallpaper.common.carousel.transitionEffect": {
		options: [
			choice("fade", "淡入淡出"),
			choice("zoom", "缩放"),
			choice("slide", "滑动"),
			choice("kenburns", "镜头平移"),
		],
	},
	"backgroundWallpaper.common.dimOpacity": fractionSchema(),
	"backgroundWallpaper.overlay.opacity": fractionSchema(),
	"backgroundWallpaper.overlay.cardOpacity": fractionSchema(),
	"musicPlayerConfig.mode": {
		options: [choice("meting", "Meting API"), choice("local", "本地播放列表")],
	},
	"musicPlayerConfig.playMode": {
		options: [
			choice("list", "列表循环"),
			choice("one", "单曲循环"),
			choice("random", "随机播放"),
		],
	},
	"musicPlayerConfig.volume": fractionSchema(),
	"musicPlayerConfig.meting.server": {
		options: [
			choice("netease", "网易云音乐"),
			choice("tencent", "QQ 音乐"),
			choice("kugou", "酷狗音乐"),
			choice("baidu", "百度音乐"),
		],
	},
	"musicPlayerConfig.meting.type": {
		options: [
			choice("song", "单曲"),
			choice("playlist", "歌单"),
			choice("album", "专辑"),
			choice("search", "搜索"),
			choice("artist", "艺术家"),
		],
	},
	"commentConfig.type": {
		options: [
			choice("none", "关闭评论"),
			choice("twikoo", "Twikoo"),
			choice("waline", "Waline"),
			choice("giscus", "Giscus"),
			choice("disqus", "Disqus"),
			choice("artalk", "Artalk"),
		],
	},
	"commentConfig.waline.login": {
		options: [
			choice("enable", "匿名或登录"),
			choice("force", "必须登录"),
			choice("disable", "仅匿名"),
		],
	},
	"commentConfig.giscus.mapping": {
		options: [
			choice("pathname", "页面路径"),
			choice("url", "完整网址"),
			choice("title", "页面标题"),
			choice("og:title", "OpenGraph 标题"),
			choice("specific", "指定词语"),
			choice("number", "讨论编号"),
		],
	},
	"commentConfig.giscus.strict": binaryStringChoices(
		"启用严格匹配",
		"关闭严格匹配",
	),
	"commentConfig.giscus.reactionsEnabled": binaryStringChoices(
		"启用表态",
		"关闭表态",
	),
	"commentConfig.giscus.emitMetadata": binaryStringChoices(
		"发送元数据",
		"不发送元数据",
	),
	"commentConfig.giscus.inputPosition": {
		options: [choice("top", "评论框在上方"), choice("bottom", "评论框在下方")],
	},
	"commentConfig.giscus.loading": {
		options: [choice("lazy", "滚动到附近再加载"), choice("eager", "立即加载")],
	},
	"analyticsConfig.umamiAnalytics.replays.sampleRate": fractionSchema(),
	"analyticsConfig.umamiAnalytics.replays.maskLevel": {
		options: [
			choice("moderate", "遮罩输入框"),
			choice("strict", "遮罩全部文本"),
		],
	},
	"fontsList[].provider": {
		options: [
			choice("google", "Google Fonts"),
			choice("fontsource", "Fontsource"),
			choice("local", "本地字体"),
			choice("bunny", "Bunny Fonts"),
			choice("fontshare", "Fontshare"),
			choice("npm", "NPM 包"),
		],
	},
	"fontsList[].styles[]": {
		options: [
			choice("normal", "常规"),
			choice("italic", "斜体"),
			choice("oblique", "倾斜"),
		],
	},
	"fontsList[].display": {
		options: [
			choice("swap", "优先显示后替换"),
			choice("optional", "网络慢时使用备用字体"),
			choice("fallback", "短暂等待"),
			choice("block", "等待字体加载"),
			choice("auto", "浏览器自动"),
		],
	},
	"expressiveCodeConfig.pluginLanguageLogo.color": {
		suggestions: [
			choice("mono", "自动单色"),
			choice("original", "品牌原色"),
			choice("theme", "代码主题色"),
		],
	},
	"mermaidConfig.lightTheme": {
		options: [
			choice("editor-light", "Editor Light"),
			choice("gruvbox-light", "Gruvbox Light"),
			choice("ayu-light", "Ayu Light"),
		],
	},
	"mermaidConfig.darkTheme": {
		options: [
			choice("editor-dark", "Editor Dark"),
			choice("one-dark", "One Dark"),
			choice("gruvbox-dark", "Gruvbox Dark"),
			choice("ayu-dark", "Ayu Dark"),
		],
	},
	"spineModelConfig.position.corner": { options: cornerChoices(true) },
	"spineModelConfig.opacity": fractionSchema(),
	"live2dWidgetConfig.position": { options: cornerChoices(false) },
	"live2dWidgetConfig.transitionType": {
		options: [choice("slide", "滑入滑出"), choice("fade", "淡入淡出")],
	},
	"live2dWidgetConfig.menus.align": {
		options: [choice("left", "左侧"), choice("right", "右侧")],
	},
};

const KEY_SCHEMAS = {
	password: { type: "password", autocomplete: "new-password" },
	auth: { type: "password", autocomplete: "off" },
	date: { type: "date" },
	description: { type: "textarea", rows: 3 },
	content: { type: "textarea", rows: 4 },
	bio: { type: "textarea", rows: 3 },
	usage: { type: "textarea", rows: 3 },
	extraChars: { type: "textarea", rows: 3 },
	columnWidth: { min: 160, max: 640, step: 10, unit: "px" },
	quality: { min: 1, max: 100, step: 1, unit: "%" },
	itemsPerPage: { min: 1, max: 100, step: 1 },
	postsPerPage: { min: 1, max: 100, step: 1 },
	interval: { min: 100, max: 60000, step: 100, unit: "ms" },
	duration: { min: 100, max: 60000, step: 100, unit: "ms" },
	maxDuration: { min: 1000, max: 3600000, step: 1000, unit: "ms" },
	transitionDuration: { min: 0, max: 10000, step: 100, unit: "ms" },
	mobileBreakpoint: { min: 320, max: 1600, step: 1, unit: "px" },
	opacity: fractionSchema(),
	volume: fractionSchema(),
	scale: { min: 0.1, max: 4, step: 0.1 },
	zIndex: { min: -10, max: 10000, step: 1 },
};

const FIELD_PRESENTATION = {
	fontsList: { label: "字体资源", help: "管理 Astro 构建时加载和优化的字体。" },
	cssVariable: {
		label: "CSS 变量名",
		help: "以 --font- 开头，供下面的字体选择配置引用。",
	},
	provider: { label: "字体来源", help: "选择字体由哪个服务或本地文件提供。" },
	weights: { label: "字重", help: "每项填写一个字重，例如 400 或 700。" },
	styles: { label: "字体样式", help: "选择需要加载的常规、斜体或倾斜样式。" },
	subsets: { label: "字符子集", help: "按需加载 latin、cyrillic 等字符子集。" },
	fallbacks: { label: "备用字体", help: "当前字体不可用时按顺序使用。" },
	display: { label: "加载策略", help: "控制网页字体下载期间如何显示文字。" },
	selected: {
		label: "全局字体组合",
		help: "按顺序填写字体 CSS 变量；system 表示系统字体。",
	},
	bannerTitleFont: { label: "横幅标题字体", help: "留空时使用全局字体。" },
	bannerSubtitleFont: { label: "横幅副标题字体", help: "留空时使用全局字体。" },
	navbarTitleFont: { label: "导航栏标题字体", help: "留空时使用全局字体。" },
	codeFont: { label: "代码字体", help: "代码块和等宽文本使用的字体变量。" },
	subsetFonts: {
		label: "本地字体子集化",
		help: "仅用于本地字体，减少最终字体文件体积。",
	},
	leftComponents: { label: "左侧栏组件", help: "可调整顺序、启停和显示位置。" },
	rightComponents: {
		label: "右侧栏组件",
		help: "可调整顺序、启停和显示位置。",
	},
	mobileBottomComponents: {
		label: "移动端底部组件",
		help: "只在手机端页面底部显示。",
	},
	showOnPostPage: {
		label: "文章页显示",
		help: "是否在文章详情页显示这个组件。",
	},
	hideOnNonPostPage: {
		label: "仅文章页显示",
		help: "开启后在首页等非文章页面隐藏。",
	},
	showTitle: { label: "显示组件标题", help: "关闭后只显示组件内容。" },
	specificConfig: { label: "组件详细设置", help: "当前组件独有的显示参数。" },
	collapseThreshold: {
		label: "自动折叠阈值",
		help: "项目数量超过此值时折叠。",
	},
	displayCount: { label: "展示次数", help: "-1 表示不限次数。" },
	padding: { label: "内边距", help: "支持 px、rem 等 CSS 尺寸。" },
	imgurl: { label: "头像或站标", help: "友链卡片使用的图片地址。" },
	desc: { label: "友链简介", help: "简要介绍这个站点。" },
	siteurl: { label: "站点地址", help: "点击友链卡片后打开的网址。" },
	id: { label: "唯一标识", help: "同时作为 URL 路径和相册目录名。" },
	cover: { label: "封面地址", help: "留空时由主题自动选择封面。" },
	passwordHint: { label: "密码提示", help: "访问者输入错误密码时显示。" },
	usage: { label: "打赏用途", help: "说明赞助将用于什么。" },
	parent: { label: "Memos 用户", help: "格式为 users/用户名，用于筛选动态。" },
	method: { label: "搜索方式", help: "主题使用的站内搜索实现。" },
	playerMode: { label: "视频播放顺序", help: "多段背景视频的切换方式。" },
	homeText: { label: "首页横幅文字", help: "控制首页壁纸上的标题和副标题。" },
	titleSize: { label: "标题字号", help: "填写 rem、px 等 CSS 字号。" },
	subtitleSize: { label: "副标题字号", help: "填写 rem、px 等 CSS 字号。" },
	typewriter: { label: "打字机效果", help: "循环输入和删除多条副标题。" },
	deleteSpeed: { label: "删除速度", help: "删除一个字符的间隔时间。" },
	pauseTime: { label: "停留时间", help: "一句副标题完整显示后的等待时间。" },
	transparentMode: {
		label: "导航栏透明模式",
		help: "控制壁纸上方导航栏的透明方式。",
	},
	enableBlur: { label: "毛玻璃效果", help: "开启后导航栏使用背景模糊。" },
	waves: { label: "水波纹效果", help: "可分别控制桌面端和移动端。" },
	gradient: { label: "底部渐变", help: "水波纹关闭时用于衔接壁纸与页面背景。" },
	carousel: { label: "壁纸轮播", help: "配置多张壁纸时自动切换。" },
	transitionEffect: { label: "过渡效果", help: "壁纸轮播时使用的动画。" },
	playerUrl: { label: "背景视频", help: "逐项填写本地路径或网络视频地址。" },
	meting: { label: "Meting 服务", help: "使用在线音乐服务时生效。" },
	local: { label: "本地播放列表", help: "使用本地音乐模式时生效。" },
	fallbackApis: { label: "备用 API", help: "主服务失败时按顺序尝试。" },
	login: { label: "登录模式", help: "控制访客是否需要登录后评论。" },
	strict: { label: "严格匹配", help: "Giscus 是否使用严格的页面映射。" },
	reactionsEnabled: { label: "评论表态", help: "允许访客对讨论作出表态。" },
	emitMetadata: {
		label: "发送讨论元数据",
		help: "让父页面接收 Giscus 元数据。",
	},
	inputPosition: {
		label: "评论框位置",
		help: "选择输入框显示在评论列表上方或下方。",
	},
	loading: { label: "加载方式", help: "延迟加载可减少首屏资源。" },
	replaysScriptUrl: {
		label: "回放脚本地址",
		help: "Umami 会话回放脚本的网址。",
	},
	blockSelector: {
		label: "排除录制的元素",
		help: "填写不应进入会话回放的 CSS 选择器。",
	},
	la51Analytics: { label: "51.la 统计", help: "配置 51.la 访问统计与录屏。" },
	autoTrack: { label: "自动事件分析", help: "自动记录常见访客行为。" },
	hashMode: {
		label: "Hash 路由模式",
		help: "当前项目使用 History API，通常保持关闭。",
	},
	screenRecord: { label: "网站录屏", help: "允许统计服务记录访客会话。" },
	enableInPost: {
		label: "文章页显示封面",
		help: "是否在文章详情页显示封面图。",
	},
	enableInPostOverlay: {
		label: "标题叠加在封面",
		help: "把标题和文章信息显示在封面图上。",
	},
	profileUrl: {
		label: "资料跳转地址",
		help: "点击动态头像或名称后打开的页面。",
	},
	memos: { label: "Memos 数据源", help: "开启后动态将从 Memos 实时读取。" },
	sakuraNum: {
		label: "樱花数量",
		help: "数量越大效果越密集，也会增加渲染开销。",
	},
	limitTimes: { label: "循环次数", help: "-1 表示无限循环。" },
	min: { label: "最小值", help: "此项效果允许的最小数值。" },
	max: { label: "最大值", help: "此项效果允许的最大数值。" },
	horizontal: { label: "水平移动", help: "控制水平方向速度范围。" },
	vertical: { label: "垂直移动", help: "控制垂直方向速度范围。" },
	rotation: { label: "旋转速度", help: "控制花瓣或模型旋转速度。" },
	fadeSpeed: { label: "淡出速度", help: "应小于或等于最小透明度。" },
	pluginLanguageLogo: { label: "语言 Logo", help: "在代码块中显示语言图标。" },
	excludedLangs: { label: "排除语言", help: "这些语言不会显示 Logo。" },
	corner: { label: "停靠位置", help: "选择模型显示在页面哪个角落。" },
	offsetX: { label: "水平偏移", help: "模型距离停靠边缘的水平距离。" },
	offsetY: { label: "垂直偏移", help: "模型距离停靠边缘的垂直距离。" },
	interactive: {
		label: "点击与待机交互",
		help: "配置动画、提示文字和切换间隔。",
	},
	clickAnimations: {
		label: "点击动画",
		help: "点击模型时随机播放；每项一个动画名。",
	},
	clickMessages: {
		label: "点击提示语",
		help: "点击模型时随机显示；每项一句。",
	},
	idleAnimations: { label: "待机动画", help: "模型待机时循环播放。" },
	idleInterval: { label: "待机切换间隔", help: "切换待机动画的时间。" },
	menus: { label: "模型菜单", help: "配置模型旁的快捷操作。" },
	items: { label: "菜单项", help: "可以调整顺序、添加或删除。" },
	label: { label: "显示文字", help: "访客看到的菜单名称。" },
	action: { label: "动作", help: "看板娘组件支持的动作标识。" },
	tips: { label: "提示气泡", help: "配置欢迎语、循环消息和显示节奏。" },
	welcomeMessage: { label: "欢迎语", help: "首次显示模型时随机展示。" },
	messages: { label: "循环提示", help: "模型空闲时循环显示。" },
	primaryColor: {
		label: "界面主题色",
		help: "支持 CSS 颜色或变量，例如 var(--primary)。",
	},
};

const ARRAY_TEMPLATES = {
	"siteConfig.favicon": { src: "", theme: "light", sizes: "32x32" },
	"profileConfig.links": {
		name: "",
		icon: "material-symbols:link",
		url: "",
		showName: false,
	},
	"sidebarLayoutConfig.leftComponents": sidebarComponentTemplate(true),
	"sidebarLayoutConfig.rightComponents": sidebarComponentTemplate(true),
	"sidebarLayoutConfig.mobileBottomComponents": sidebarComponentTemplate(false),
	"musicPlayerConfig.local.playlist": {
		name: "",
		artist: "",
		url: "",
		cover: "",
		lrc: "",
	},
	fontsList: {
		name: "",
		cssVariable: "--font-",
		provider: "fontsource",
		weights: ["400"],
		styles: ["normal"],
		subsets: ["latin"],
		fallbacks: ["sans-serif"],
	},
	"fontsList[].options.variants": { src: [], weight: "400", style: "normal" },
	friendsConfig: {
		title: "",
		imgurl: "",
		desc: "",
		siteurl: "",
		tags: [],
		weight: 0,
		enabled: true,
	},
	"galleryConfig.albums": {
		id: "",
		name: "",
		description: "",
		location: "",
		date: "",
		tags: [],
		cover: "",
		password: "",
		passwordHint: "",
	},
	"sponsorConfig.methods": {
		name: "",
		icon: "material-symbols:favorite-outline",
		qrCode: "",
		link: "",
		description: "",
		enabled: true,
	},
	"sponsorConfig.sponsors": { name: "", amount: "", date: "", avatar: "" },
	"live2dWidgetConfig.model": { path: "", volume: 0, scale: 1, x: 0, y: 0 },
	"live2dWidgetConfig.menus.items": { icon: "mdi:link", label: "", action: "" },
};

const OBJECT_EXTRA_FIELDS = {
	"siteConfig.favicon[]": { theme: "light", sizes: "32x32" },
	"sidebarLayoutConfig.leftComponents[]": {
		showTitle: true,
		hideOnNonPostPage: false,
	},
	"sidebarLayoutConfig.rightComponents[]": {
		showTitle: true,
		hideOnNonPostPage: false,
	},
	"sidebarLayoutConfig.mobileBottomComponents[]": {
		showTitle: true,
		hideOnNonPostPage: false,
	},
	"fontsList[]": { display: "swap" },
	"fontsList[].options.variants[]": { weight: "400", style: "normal" },
	"galleryConfig.albums[]": { cover: "", password: "", passwordHint: "" },
};

function sidebarComponentChoices() {
	return [
		choice("profile", "个人资料"),
		choice("announcement", "公告"),
		choice("music", "音乐播放器"),
		choice("categories", "分类"),
		choice("tags", "标签"),
		choice("dynamic", "最新动态"),
		choice("stats", "站点统计"),
		choice("siteInfo", "站点信息"),
		choice("calendar", "日历"),
		choice("sidebarToc", "文章目录"),
		choice("advertisement", "广告栏"),
	];
}

function componentPositionChoices() {
	return [choice("top", "固定在顶部"), choice("sticky", "随页面滚动")];
}

function cornerChoices(includeTop) {
	const values = [
		choice("bottom-left", "左下角"),
		choice("bottom-right", "右下角"),
	];
	if (includeTop)
		values.push(choice("top-left", "左上角"), choice("top-right", "右上角"));
	return values;
}

function fractionSchema() {
	return { min: 0, max: 1, step: 0.05, unit: "" };
}

function binaryStringChoices(onLabel, offLabel) {
	return { options: [choice("1", onLabel), choice("0", offLabel)] };
}

function sidebarComponentTemplate(withPosition) {
	return {
		type: "profile",
		enable: true,
		...(withPosition ? { position: "top" } : {}),
		showOnPostPage: true,
	};
}

export function normalizeStudioPath(path) {
	return String(path).replace(/\.\d+(?=\.|$)/g, "[]");
}

export function getStudioDocumentGuide(path) {
	return DOCUMENT_GUIDES[path] || "";
}

export function getStudioFieldSchema(path, value) {
	const normalized = normalizeStudioPath(path);
	const key = normalized.split(".").at(-1)?.replace("[]", "") || normalized;
	const schema = {
		...(KEY_SCHEMAS[key] || {}),
		...(PATH_SCHEMAS[normalized] || {}),
	};
	if (!schema.type && typeof value === "string") {
		if (
			/^(?:https?:\/\/|\/|assets\/|\.\/)/.test(value) &&
			/(?:url|src|path|cover|avatar|image|api|server|repo|link)/i.test(key)
		)
			schema.type = "url";
		if (/date$/i.test(key)) schema.type = "date";
	}
	return schema;
}

export function getStudioFieldPresentation(path) {
	const normalized = normalizeStudioPath(path);
	const key = normalized.split(".").at(-1)?.replace("[]", "") || normalized;
	return {
		...(FIELD_PRESENTATION[key] || {}),
		...(PATH_SCHEMAS[normalized] || {}),
	};
}

export function getStudioArrayTemplate(path, items = []) {
	const normalized = normalizeStudioPath(path);
	const configured = ARRAY_TEMPLATES[normalized];
	if (configured !== undefined) return structuredClone(configured);
	if (items.length) return blankValue(items[0]);
	return "";
}

export function getStudioObjectExtraFields(path) {
	return structuredClone(OBJECT_EXTRA_FIELDS[normalizeStudioPath(path)] || {});
}

export function isStudioFieldVisible(path, values) {
	if (path.startsWith("commentConfig.") && path.split(".").length === 2) {
		const service = path.split(".")[1];
		if (["twikoo", "waline", "artalk", "giscus", "disqus"].includes(service))
			return values.commentConfig?.type === service;
	}
	if (path === "musicPlayerConfig.meting")
		return values.musicPlayerConfig?.mode === "meting";
	if (path === "musicPlayerConfig.local")
		return values.musicPlayerConfig?.mode === "local";
	if (path === "backgroundWallpaper.banner")
		return values.backgroundWallpaper?.mode === "banner";
	if (path === "backgroundWallpaper.overlay")
		return values.backgroundWallpaper?.mode === "overlay";
	if (path === "backgroundWallpaper.fullscreen")
		return values.backgroundWallpaper?.mode === "fullscreen";
	return true;
}

export function formatStudioItemTitle(item, index) {
	if (item && typeof item === "object") {
		const value = [
			item.title,
			item.name,
			item.label,
			item.id,
			item.type,
			item.src,
			item.path,
			item.url,
			item.action,
		].find((candidate) =>
			Array.isArray(candidate) ? candidate.length > 0 : String(candidate || "").trim(),
		);
		if (Array.isArray(value)) return value.join("、") || `项目 ${index + 1}`;
		if (value !== undefined) return String(value);
	}
	return `项目 ${index + 1}`;
}

function blankValue(value) {
	if (Array.isArray(value)) return [];
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, blankValue(item)]),
		);
	}
	if (typeof value === "boolean") return true;
	if (typeof value === "number") return 0;
	return "";
}
