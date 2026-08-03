import type { Favicon } from "@/types/config.ts";

export const defaultFavicons: Favicon[] = [
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
];
