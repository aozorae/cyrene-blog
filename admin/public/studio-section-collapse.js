import { normalizeStudioPath } from "./studio-field-schema.js";

const SECTION_SUMMARIES = {
	"backgroundWallpaper.src.desktop": (value) => formatListSummary(value, "项资源"),
	"backgroundWallpaper.src.mobile": (value) => formatListSummary(value, "项资源"),
	"backgroundWallpaper.src.playerUrl": (value) => formatListSummary(value, "段视频"),
	"backgroundWallpaper.common.homeText.subtitle": (value) =>
		formatListSummary(value, "条内容"),
	"backgroundWallpaper.common.homeText.typewriter": (value) =>
		`${formatEnabled(value?.enable)} · ${countObjectFields(value)} 项设置`,
	"backgroundWallpaper.common.waves": (value) => formatDeviceSummary(value?.enable),
	"backgroundWallpaper.common.gradient": (value) =>
		`${formatDeviceSummary(value?.enable)} · 高度 ${value?.height || "未设置"}`,
	"backgroundWallpaper.common.carousel": (value) =>
		`${formatEnabled(value?.enable)} · 间隔 ${formatDuration(value?.interval)}`,
};

export function getStudioCollapsibleSection(path, value) {
	const formatter = SECTION_SUMMARIES[normalizeStudioPath(path)];
	if (!formatter) return null;
	return { summary: formatter(value) };
}

function formatListSummary(value, unit) {
	const count = Array.isArray(value) ? value.length : value ? 1 : 0;
	return count ? `${count} ${unit}` : "暂无内容";
}

function formatEnabled(value) {
	return value ? "已启用" : "已停用";
}

function formatDeviceSummary(value) {
	if (!value || typeof value !== "object") return "桌面与移动端均未设置";
	if (value.desktop && value.mobile) return "桌面与移动端均启用";
	if (value.desktop) return "仅桌面端启用";
	if (value.mobile) return "仅移动端启用";
	return "桌面与移动端均停用";
}

function countObjectFields(value) {
	return value && typeof value === "object" ? Object.keys(value).length : 0;
}

function formatDuration(value) {
	const duration = Number(value);
	if (!Number.isFinite(duration)) return "未设置";
	return duration >= 1000 && duration % 1000 === 0
		? `${duration / 1000} 秒`
		: `${duration} 毫秒`;
}
