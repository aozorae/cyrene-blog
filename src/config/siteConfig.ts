import type { SiteConfig } from "@/types/siteConfig";
import { resolvePageToggles } from "../utils/page-toggle-utils";
import { resolveSiteLang } from "../utils/site-config-utils";

// 定义站点语言
// 语言代码，例如：'zh_CN', 'zh_TW', 'en', 'ja', 'ru', 'ko'。
const SITE_LANG = resolveSiteLang("zh_CN");

// 页面开关配置 - 控制特定页面的访问权限，设为false会返回404并自动隐藏对应的导航栏菜单项
// 单独导出原始页面开关，让管理后台编辑纯配置；运行时再应用部署平台环境变量覆盖。
export const pageToggles: SiteConfig["pages"] = {
	// ── 社交 (Social) ──────────────────────────────────

	// 友链页面开关
	friends: true,
	// 留言板页面开关，需要配置评论系统
	guestbook: true,

	// ── 我的 (My) ──────────────────────────────────

	// 动态页面开关
	dynamic: true,
	// 相册页面开关
	gallery: true,
	// 书签导航页面开关
	booknav: true,
	// 哔哩哔哩追番页面开关
	bilibili: false,
	// 番组计划页面开关
	bangumi: false,
	// VNDB页面开关
	vndb: false,
	// MyAnimeList页面开关
	mal: false,

	// ── 关于 (About) ──────────────────────────────────

	// 打赏页面开关
	sponsor: true,
};

const resolvedPages = resolvePageToggles(pageToggles);

export const siteConfig: SiteConfig = {
	title: "Cyrene",
	subtitle: "demo site",
	site_url: "https://cyrene-blog.vercel.app",
	description: "Hello, I'm Cyrene",
	keywords: [
		"昔涟",
		"Cyrene",
		"aozorae",
		"Astro",
		"Svelte",
		"Tailwind CSS",
		"TypeScript",
		"Vercel",
		"Cloudflare Workers",
		"GitHub Actions",
		"技术博客",
	],
	themeColor: {
		hue: 357,
		defaultMode: "system",
	},
	pageWidth: 100,
	card: {
		border: false,
		followTheme: false,
	},
	favicon: [
		{
			src: "/favicon/favicon.ico",
		},
		{
			src: "/favicon/favicon-16x16.png",
			sizes: "16x16",
		},
		{
			src: "/favicon/favicon-32x32.png",
			sizes: "32x32",
		},
		{
			src: "/favicon/android-chrome-192x192.png",
			sizes: "192x192",
		},
	],
	navbar: {
		logo: {
			type: "image",
			value: "assets/images/logo/firefly-light.png",
			valueDark: "assets/images/logo/firefly-dark.png",
			alt: "🍀",
		},
		title: "昔涟",
		widthFull: false,
		menuAlign: "center",
		followTheme: false,
		stickyNavbar: true,
	},
	// 站点开始日期，用于统计运行天数
	siteStartDate: "2025-01-01",

	// 站点时区（IANA 时区字符串），用于格式化bangumi、rss里的构建日期时间等等..
	// 示例："Asia/Shanghai", "UTC", 如果为空，则按照构建服务器的时区进行时区转换
	timezone: "Asia/Shanghai",

	// 页面开关配置 - 控制特定页面的访问权限，设为false会返回404并自动隐藏对应的导航栏菜单项

	// 分类导航栏开关，在首页和归档页顶部显示分类快捷导航
	categoryBar: true,

	// 分类导航栏按钮样式
	// "pill"：胶囊，主题色浅底圆角
	// "rectangle"：矩形，配色同胶囊，仅圆角更小
	categoryStyle: "rectangle",

	// 标签样式，作用于文章列表底部标签、标签页和侧边栏标签
	// "pill"：胶囊，主题色底圆角
	// "pill-gray"：胶囊，中性灰底圆角
	// "rectangle"：矩形，主题色底小圆角
	tagStyle: "pill",

	// 归档页是否折叠非最新年份文章，禁用后默认展开全部年份
	foldArticle: true,

	// ── 文章列表布局配置 ──────────────────────────────────
	postListLayout: {
		// 默认布局模式："list" 列表模式（单列布局），"grid" 网格模式（多列布局）
		defaultMode: "list",
		// 移动端默认布局模式，不设置则跟随 defaultMode
		mobileDefaultMode: "grid",
		// 列表模式下封面图显示在哪一侧："right" 右侧，"left" 左侧
		// 网格模式的封面固定在卡片顶部，不受此项影响
		coverPosition: "right",
		// 文章简介显示行数，设为 0 则不截断
		descriptionLines: 2,
		// 文章卡片底部统计和发布日期是否显示图标
		showStatsIcons: true,
		// 标签显示位置
		// 设置为"meta"：显示在文章标题下的元数据
		// 设置为"bottom"：顶替stats在底部显示
		tagsPosition: "bottom",
		// 底部标签样式，仅在 tagsPosition 为 "bottom" 时生效
		// "chip"：按钮样式，形状跟随上方的 tagStyle 配置
		// "text"：无底色，只有文字
		tagsBottomStyle: "chip",
		// PostMeta 元数据显示控制
		meta: {
			// 是否显示发布日期
			showPublished: true,
			// 是否显示分类
			showCategory: true,
			// 是否显示标签
			showTags: true,
			// 标签数量，设为 0 则不限制
			tagCount: 5,
			// 是否显示字数
			showWords: false,
			// 是否显示阅读时间
			showReadingTime: false,
		},
		stats: {
			showPublished: true,
			showWords: true,
			showReadingTime: true,
		},
		// 网格布局配置，仅在 defaultMode 为 "grid" 或允许切换布局时生效
		grid: {
			// 是否开启瀑布流布局，同时有封面图和无封面图的混合文章推荐开启
			masonry: false,
			// 网格模式卡片最小宽度(px)，浏览器根据容器宽度自动计算列数
			columnWidth: 320,
			// 网格模式封面是否撑满卡片贴边
			// true：封面顶到卡片左右和上边缘，只有上面两角是圆角
			// false：封面按卡片内边距内缩，上、左、右留出间距，四角都是圆角
			coverFullWidth: false,
		},
	},
	// 分页配置
	pagination: {
		// 每页显示的文章数量
		postsPerPage: 10,
	},

	// ── 文章内容页配置 ──────────────────────────────────
	post: {
		// 提醒框（Admonitions）配置，修改后需要重启开发服务器才能生效
		// 主题：'github' | 'obsidian' | 'vitepress' | 'docusaurus'，每个主题风格和语法不同，可根据喜好选择
		rehypeCallouts: {
			theme: "github",
			// 是否启用兼容 Python-Markdown 风格的 admonition 语法（!!!和???语法）
			// 注意：只有 theme 配置成 obsidian 主题才能基本支持这些语法，其他主题会有样式问题或不兼容的情况
			enablePythonMarkdownAdmonitions: false,
		},
		// 文章页底部的"上次编辑时间"卡片开关
		showLastModified: true,
		// 文章过期阈值（天数），超过此天数才显示"上次编辑"卡片
		outdatedThreshold: 30,
		// 是否开启分享海报生成功能
		sharePoster: true,
		// OpenGraph图片功能，注意开启后要渲染很长时间，不建议本地调试的时候开启
		generateOgImages: false,
	},

	// ── Bilibili配置 ──────────────────────────────────
	bilibili: {
		// 你的 Bilibili 用户 UID
		uid: "",
	},

	// ── 番组计划bangumi配置 ──────────────────────────────────
	bangumi: {
		// Bangumi用户ID
		userId: "",
		// 数据模式：static=构建时获取，dynamic=客户端实时获取
		// static 模式在构建时获取数据并静态渲染，部署后数据不更新
		// dynamic 模式在浏览器中实时请求 API，始终显示最新数据
		mode: "dynamic",
		// Bangumi API 地址
		apiUrl: "https://bgmapi.anibt.net",
		// 详情页地址
		subjectBaseUrl: "https://bgmmi.anibt.net/subject/",
		// 条目类型排序，数组中的类型将按顺序优先展示
		// 可选值: "anime" | "book" | "music" | "game" | "real" (暂不支持"real"类型)
		// 未列出的类型将按默认顺序排在后面
		categoryOrder: ["anime", "book", "music", "game"],
		// 控制各分类的启用状态（true/false），未指定的分类默认启用
		// categories: {
		// 	game: false, // 禁用游戏分类显示
		// },
	},

	// ── VNDB配置 ──────────────────────────────────
	vndb: {
		// VNDB 用户 ID
		userId: "",
		// 数据模式：static=构建时获取，dynamic=客户端实时获取
		// static 模式在构建时获取数据并静态渲染，部署后数据不更新
		// dynamic 模式在浏览器中实时请求 API，始终显示最新数据
		mode: "static",
		// 构建时下载并压缩封面到 public/vndb-covers，图片由本站服务器提供
		downloadCovers: false,
		// VNDB API 地址
		apiUrl: "https://api.vndb.org/kana",
		// 条目详情页地址，末尾需要带 /
		vnBaseUrl: "https://vndb.org/",
		// 私密列表访问令牌仅 static 模式下使用，请通过 VNDB_API_TOKEN 环境变量配置
		// 对Nsfw的游戏封面模糊化
		blurNsfw: true,
	},

	// ── MyAnimeList配置 ──────────────────────────────────
	mal: {
		// MyAnimeList 用户名（列表需为公开状态，私密列表无法读取）
		username: "",
		// MyAnimeList Client ID，在 https://myanimelist.net/apiconfig 注册免费应用后获取
		clientId: "",
		// MAL API 地址
		apiUrl: "https://api.myanimelist.net/v2",
		// 动画条目详情页地址，末尾需要带 /
		animeBaseUrl: "https://myanimelist.net/anime/",
		// 漫画条目详情页地址，末尾需要带 /
		mangaBaseUrl: "https://myanimelist.net/manga/",
	},

	// ── 图像优化配置 ──────────────────────────────────
	// 图像优化压缩只保留avif或webp
	// 响应式图像是为在不同设备上提高性能而调整的图像。这些图像可以调整大小以适应其容器，并且可以根据访问者的屏幕尺寸和分辨率以不同的大小提供。
	// Astro 仅能对 src 目录下的图像进行优化，src 目录下的图像越多，构建时间会越长
	// Astro 图像文档 https://docs.astro.build/zh-cn/guides/images/
	imageOptimization: {
		// 输出图片格式
		// - "avif": 仅输出 AVIF 格式（最新技术，最小体积，目前兼容性较低，构建时间较长）
		// - "webp": 仅输出 WebP 格式（体积适中，兼容性好，构建时间短）
		// - "both": 同时输出 AVIF 和 WebP（浏览器自动选择最佳格式）
		formats: "webp",
		// 图片压缩质量 (1-100)，值越低体积越小但质量越差，推荐 70-85
		quality: 85,
		// 为特定域名的图片添加 referrerpolicy="no-referrer" 属性
		// 支持通配符 *，例如：["i0.hdslb.com", "*.bilibili.com"]
		// 可解决指定域名图片加载时的 403 问题（如防盗链图片）
		noReferrerDomains: [
			"*.hdslb.com",
			"*.bilibili.com",
			"*.myanimelist.net",
			"*.vndb.org",
		],
	},

	// 站点语言，在本配置文件顶部SITE_LANG定义
	lang: SITE_LANG,

	// 页面开关配置在文件顶部维护，运行时值已叠加部署平台环境变量。
	pages: resolvedPages,
};
