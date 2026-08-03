import type { SiteConfig } from "@/types/siteConfig";

// 定义站点语言
// 语言代码，例如：'zh_CN', 'zh_TW', 'en', 'ja', 'ru', 'ko'。
const SITE_LANG = "zh_CN";

export const siteConfig: SiteConfig = {
	"title": "Cyrene - demo site",
	"subtitle": "Cyrene - demo site",
	"site_url": "https://cyrene-blog.vercel.app",
	"description": "Hello, I'm Cyrene",
	"keywords": [
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
		"技术博客"
	],
	"themeColor": {
		"hue": 357,
		"defaultMode": "system"
	},
	"pageWidth": 100,
	"card": {
		"border": false,
		"followTheme": false
	},
	"favicon": [
		{
			"src": "/favicon/firefly-32.png"
		}
	],
	"navbar": {
		"logo": {
			"type": "image",
			"value": "assets/images/logo/firefly-light.png",
			"valueDark": "assets/images/logo/firefly-dark.png",
			"alt": "🍀"
		},
		"title": "昔涟",
		"widthFull": false,
		"menuAlign": "center",
		"followTheme": false,
		"stickyNavbar": true
	},
	"siteStartDate": "2025-01-01",
	"timezone": "Asia/Shanghai",
	"pages": {
		"friends": true,
		"sponsor": true,
		"guestbook": true,
		"bangumi": false,
		"gallery": true,
		"anime": false,
		"dynamic": true
	},
	"categoryBar": true,
	"foldArticle": true,
	"postListLayout": {
		"defaultMode": "list",
		"mobileDefaultMode": "grid",
		"descriptionLines": 2,
		"showStatsIcons": true,
		"tagsPosition": "bottom",
		"meta": {
			"showPublished": true,
			"showCategory": true,
			"showTags": true,
			"tagCount": 5,
			"showWords": false,
			"showReadingTime": false
		},
		"stats": {
			"showPublished": true,
			"showWords": true,
			"showReadingTime": true
		},
		"grid": {
			"masonry": false,
			"columnWidth": 320
		}
	},
	"post": {
		"rehypeCallouts": {
			"theme": "github",
			"enablePythonMarkdownAdmonitions": false
		},
		"showLastModified": true,
		"outdatedThreshold": 30,
		"sharePoster": true,
		"generateOgImages": false
	},
	"bangumi": {
		"userId": "",
		"mode": "dynamic",
		"apiUrl": "https://bgmapi.anibt.net",
		"subjectBaseUrl": "https://bgmmi.anibt.net/subject/",
		"categoryOrder": [
			"anime",
			"book",
			"music",
			"game"
		]
	},
	"anime": {
		"bilibili": {
			"uid": ""
		}
	},
	"pagination": {
		"postsPerPage": 10
	},
	"imageOptimization": {
		"formats": "webp",
		"quality": 85,
		"noReferrerDomains": [
			"*.hdslb.com",
			"*.bilibili.com"
		]
	},
	"lang": SITE_LANG
};
