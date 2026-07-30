import type { FriendLink, FriendsPageConfig } from "../types/friendsConfig";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
	"title": "",
	"description": "",
	"showCustomContent": true,
	"showComment": true,
	"randomizeSort": false
};

// 友链配置
export const friendsConfig: FriendLink[] = [
	{
		"title": "友链位置11",
		"imgurl": "https://weavatar.com/avatar/d252655d40d6874417a720bad0a6c5f77f8f6a1fd2f882f8f338402dc37e4190?s=640",
		"desc": "这个位置将用于展示后续添加的友链。",
		"siteurl": "https://cyrene-blog.vercel.app",
		"tags": [
			"占位"
		],
		"weight": 10,
		"enabled": true
	},
	{
		"title": "项目仓库",
		"imgurl": "/favicon/firefly-32.png",
		"desc": "昔涟博客的源代码与更新记录。",
		"siteurl": "https://github.com/aozorae/cyrene-blog",
		"tags": [
			"GitHub"
		],
		"weight": 9,
		"enabled": true
	},
	{
		"title": "Astro",
		"imgurl": "https://avatars.githubusercontent.com/u/44914786?v=4&s=640",
		"desc": "The web framework for content-driven websites. ⭐️ Star to support our work!",
		"siteurl": "https://github.com/withastro/astro",
		"tags": [
			"Framework"
		],
		"weight": 8,
		"enabled": true
	}
];

// 获取启用的友链并进行排序
export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
