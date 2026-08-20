import type { BackgroundWallpaperConfig } from "@/types/backgroundWallpaper";

export const backgroundWallpaper: BackgroundWallpaperConfig = {
	// 壁纸模式："banner" 横幅壁纸，"fullscreen" 全屏壁纸，"overlay" 覆盖透明，"none" 纯色背景无壁纸
	mode: "banner",
	playerEnable: true,
	src: {
		desktop: [
			"assets/images/DesktopWallpaper/cyrene-pc-01.avif",
			"assets/images/DesktopWallpaper/cyrene-pc-02.avif",
			"assets/images/DesktopWallpaper/cyrene-pc-03.avif",
			"assets/images/DesktopWallpaper/cyrene-pc-05.avif",
		],
		mobile: [
			"assets/images/MobileWallpaper/cyrene-mobile-01.avif",
			"assets/images/MobileWallpaper/cyrene-mobile-02.avif",
			"assets/images/MobileWallpaper/cyrene-mobile-03.avif",
			"assets/images/MobileWallpaper/cyrene-mobile-04.avif",
		],
		// 个人站点没有配置背景视频，保持空数组以避免加载上游演示资源
		playerUrl: [],
	},
	common: {
		dimOpacity: 0.2,
		playerMode: "random",
		homeText: {
			enable: true,
			title: "昔涟",
			titleSize: "4.5rem",
			subtitle: ["“下一页是空白呢，那我们一起写下吧？”"],
			subtitleSize: "1.5rem",
			typewriter: {
				enable: true,
				speed: 100,
				deleteSpeed: 50,
				pauseTime: 2000,
			},
			// 是否显示标题下方的链接图标
			linksEnable: true,
			// 首页横幅标题下方的链接图标（可选，支持 showName 显示文字）
			// 图标支持 Iconify 格式：fa7-brands:github、fa7-solid:envelope、mdi:rss 等
			links: [
				{
					name: "GitHub",
					icon: "fa7-brands:github",
					url: "https://github.com/aozorae/cyrene-blog",
					showName: true,
				},
				{
					name: "RSS",
					icon: "fa7-solid:rss",
					url: "/rss/",
				},
			],
		},
		// 壁纸轮播配置，横幅壁纸和全屏壁纸共享，仅在配置多张图片时生效
		carousel: {
			// 是否启用壁纸轮播；关闭时保持每次刷新随机显示一张
			enable: false,
			// 轮播切换间隔（毫秒）
			interval: 5000,
			// 过渡效果: 'fade' 渐变 | 'zoom' 缩放 | 'slide' 滑动 | 'kenburns' 旋转木马
			transitionEffect: "zoom",
		},
	},
	// Banner模式特有配置
	banner: {
		// 图片位置
		// 支持所有CSS object-position值，如: 'top', 'center', 'bottom', 'left top', 'right bottom', '25% 75%', '10px 20px'..
		// 如果不知道怎么配置百分百之类的配置，推荐直接使用：'center'居中，'top'顶部居中，'bottom' 底部居中，'left'左侧居中，'right'右侧居中
		position: "0% 20%",
		// 文章横幅信息："description" 显示描述，"meta" 显示日期、字数和阅读时长
		postInfo: {
			mode: "description",
		},
		navbar: {
			transparentMode: "semi",
			// 毛玻璃模糊度，0 即关闭导航栏的毛玻璃
			// 注意：导航栏子菜单与浮动面板始终保留毛玻璃，模糊度跟随此项但有最小值
			blur: 5,
		},
		// 水波纹动画效果配置，开启会影响页面性能，增加内存占用，请根据自己的喜好开启
		waves: {
			enable: {
				desktop: true,
				mobile: true,
			},
		},
		gradient: {
			enable: {
				desktop: true,
				mobile: true,
			},
			height: "10%",
		},
	},
	// 覆盖透明覆盖模式特有配置
	overlay: {
		zIndex: -1,
		opacity: 0.8,
		blur: 10,
		cardOpacity: 0.5,
	},
	// 全屏壁纸模式特有配置
	// 全屏模式下壁纸固定全屏显示，首屏居中标题，内容区在首屏之下、下滑时覆盖壁纸
	// 壁纸模糊度(blur)、卡片透明度(cardOpacity)、层级(zIndex) 复用上方 overlay 模式的配置；
	// 背景透明度(opacity)不适用（全屏壁纸不透明）；导航栏透明模式由卡片透明度控制，脱离 banner 的 navbar 配置
	fullscreen: {
		position: "center",
		// 全屏壁纸模式的导航栏配置
		navbar: {
			// 是否开启动态透明：开启后首页顶部导航栏透明，下滑后变不透明（仅首页生效）
			dynamicTransparent: false,
		},
		// 首页下滑时壁纸模糊渐变开关（从 0 渐变为 overlay.blur 的最大模糊）
		// 关闭后该设备上全屏壁纸保持清晰（首页与非首页都不模糊），设置面板的模糊度滑块也会隐藏
		blurRamp: {
			enable: {
				// 桌面端是否启用模糊渐变
				desktop: true,
				// 移动端是否启用模糊渐变
				mobile: true,
			},
		},
	},
};
