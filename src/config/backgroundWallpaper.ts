import type { BackgroundWallpaperConfig } from "@/types/backgroundWallpaper";

export const backgroundWallpaper: BackgroundWallpaperConfig = {
	"mode": "banner",
	"playerEnable": true,
	"src": {
		"desktop": [
			"assets/images/DesktopWallpaper/cyrene-pc-01.avif",
			"assets/images/DesktopWallpaper/cyrene-pc-02.avif",
			"assets/images/DesktopWallpaper/cyrene-pc-03.avif",
			"assets/images/DesktopWallpaper/cyrene-pc-04.avif"
		],
		"mobile": [
			"assets/images/MobileWallpaper/cyrene-mobile-01.avif",
			"assets/images/MobileWallpaper/cyrene-mobile-02.avif",
			"assets/images/MobileWallpaper/cyrene-mobile-03.avif",
			"assets/images/MobileWallpaper/cyrene-mobile-04.avif"
		],
		"playerUrl": []
	},
	"common": {
		"dimOpacity": 0.2,
		"playerMode": "random",
		"homeText": {
			"enable": true,
			"title": "昔涟",
			"titleSize": "4.5rem",
			"subtitle": [
				"这里将写下新的故事",
				"内容仍在慢慢补充",
				"欢迎来到这个小小的角落"
			],
			"subtitleSize": "1.5rem",
			"typewriter": {
				"enable": true,
				"speed": 100,
				"deleteSpeed": 50,
				"pauseTime": 2000
			}
		},
		"postInfo": {
			"mode": "description"
		},
		"navbar": {
			"transparentMode": "semi",
			"enableBlur": true,
			"blur": 5
		},
		"waves": {
			"enable": {
				"desktop": true,
				"mobile": true
			}
		},
		"gradient": {
			"enable": {
				"desktop": true,
				"mobile": true
			},
			"height": "10%"
		},
		"carousel": {
			"enable": false,
			"interval": 5000,
			"transitionEffect": "zoom"
		}
	},
	"banner": {
		"position": "0% 20%"
	},
	"overlay": {
		"zIndex": -1,
		"opacity": 0.8,
		"blur": 10,
		"cardOpacity": 0.5
	},
	"fullscreen": {
		"position": "center"
	}
};
