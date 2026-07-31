import { normalizeStudioPath } from "./studio-field-schema.js";
import { translateText } from "./core/i18n.js";

const SUMMARY_FIELDS = {
	"siteConfig.favicon[]": ["src", "sizes"],
	"profileConfig.links[]": ["url", "icon"],
	"sidebarLayoutConfig.leftComponents[]": ["position"],
	"sidebarLayoutConfig.rightComponents[]": ["position"],
	"sidebarLayoutConfig.mobileBottomComponents[]": [],
	"musicPlayerConfig.local.playlist[]": ["artist", "url"],
	"fontsList[]": ["cssVariable", "provider"],
	"fontsList[].options.variants[]": ["weight", "style"],
	"friendsConfig[]": ["siteurl"],
	"galleryConfig.albums[]": ["id", "location", "date"],
	"sponsorConfig.methods[]": ["link", "description"],
	"sponsorConfig.sponsors[]": ["amount", "date"],
	"live2dWidgetConfig.model[]": ["path", "scale"],
	"live2dWidgetConfig.menus.items[]": ["action", "icon"],
};

const FALLBACK_FIELDS = [
	"siteurl",
	"url",
	"link",
	"src",
	"path",
	"artist",
	"cssVariable",
	"provider",
	"action",
	"description",
	"desc",
	"location",
	"date",
	"amount",
	"icon",
];

const VALUE_LABELS = {
	top: "固定在顶部",
	sticky: "随页面滚动",
	light: "亮色",
	dark: "暗色",
	normal: "常规",
	italic: "斜体",
	oblique: "倾斜",
};

export function getStudioItemSummary(path, item, title) {
	if (!item || typeof item !== "object") return { details: [], status: null };
	const fields = SUMMARY_FIELDS[normalizeStudioPath(path)] || FALLBACK_FIELDS;
	const details = [];
	for (const key of fields) {
		const value = formatSummaryValue(item[key]);
		if (!value || value === title || details.includes(value)) continue;
		details.push(value);
		if (details.length === 2) break;
	}
	return { details, status: formatItemStatus(item) };
}

function formatSummaryValue(value) {
	if (Array.isArray(value)) {
		return value
			.map((item) => formatSummaryValue(item))
			.filter(Boolean)
			.join("、");
	}
	if (typeof value === "boolean") return translateText(value ? "是" : "否");
	if (typeof value === "number") return String(value);
	if (typeof value !== "string") return "";
	const normalized = value.trim();
	return VALUE_LABELS[normalized] ? translateText(VALUE_LABELS[normalized]) : normalized;
}

function formatItemStatus(item) {
	const key = Object.hasOwn(item, "enabled")
		? "enabled"
		: Object.hasOwn(item, "enable")
			? "enable"
			: "";
	if (!key) return null;
	const value = item[key];
	const active =
		typeof value === "string"
			? !["", "0", "false", "off", "no"].includes(value.trim().toLowerCase())
			: Boolean(value);
	return { active, label: translateText(active ? "已启用" : "已停用") };
}
