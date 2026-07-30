import { applySettings, parseSettings, type SiteSettings } from "./config-editor";
import { readFile, type GitChange } from "./github";
import { HttpError } from "./response";
import type { RepositoryContext } from "./types";

const CONFIG_PATHS = {
	site: "src/config/siteConfig.ts",
	profile: "src/config/profileConfig.ts",
	announcement: "src/config/announcementConfig.ts",
	sponsor: "src/config/sponsorConfig.ts",
} as const;

function requireString(value: unknown, label: string, maxLength: number): string {
	if (typeof value !== "string") throw new HttpError(400, "CONFIG_INVALID", `${label}格式无效。`);
	if (value.length > maxLength) throw new HttpError(400, "FIELD_TOO_LONG", `${label}内容过长。`);
	return value;
}

export function validateSettings(input: unknown): SiteSettings {
	if (!input || typeof input !== "object" || Array.isArray(input)) throw new HttpError(400, "CONFIG_INVALID", "配置格式无效。");
	const value = input as Record<string, unknown>;
	const pagesInput = value.pages;
	if (!pagesInput || typeof pagesInput !== "object" || Array.isArray(pagesInput)) throw new HttpError(400, "CONFIG_INVALID", "页面开关格式无效。");
	const pages: Record<string, boolean> = {};
	for (const [key, enabled] of Object.entries(pagesInput as Record<string, unknown>)) {
		if (!/^[A-Za-z][\w-]{0,50}$/.test(key) || typeof enabled !== "boolean") throw new HttpError(400, "CONFIG_INVALID", "页面开关包含无效字段。");
		pages[key] = enabled;
	}
	if (!Array.isArray(value.sponsorMethods) || value.sponsorMethods.length > 20) throw new HttpError(400, "CONFIG_INVALID", "打赏方式格式无效。");
	const sponsorMethods = value.sponsorMethods.map((item) => {
		if (!item || typeof item !== "object" || Array.isArray(item)) throw new HttpError(400, "CONFIG_INVALID", "打赏方式格式无效。");
		const method = item as Record<string, unknown>;
		return {
			name: requireString(method.name, "打赏名称", 80),
			icon: requireString(method.icon, "打赏图标", 100),
			qrCode: requireString(method.qrCode, "二维码地址", 500),
			link: requireString(method.link, "打赏链接", 500),
			description: requireString(method.description, "打赏说明", 240),
		};
	});
	const settings: SiteSettings = {
		title: requireString(value.title, "站点标题", 500),
		subtitle: requireString(value.subtitle, "站点副标题", 500),
		siteUrl: requireString(value.siteUrl, "站点地址", 500),
		description: requireString(value.description, "站点描述", 500),
		profileName: requireString(value.profileName, "显示名称", 500),
		profileBio: requireString(value.profileBio, "个人签名", 500),
		githubUrl: requireString(value.githubUrl, "GitHub 地址", 500),
		pages,
		announcement: requireString(value.announcement, "公告内容", 500),
		announcementLink: requireString(value.announcementLink, "公告链接", 500),
		sponsorMethods,
	};
	for (const [label, url] of [["站点地址", settings.siteUrl], ["GitHub 地址", settings.githubUrl]] as const) {
		try {
			if (new URL(url).protocol !== "https:") throw new Error("protocol");
		} catch {
			throw new HttpError(400, "INVALID_URL", `${label}必须是完整的 HTTPS URL。`);
		}
	}
	return settings;
}

async function loadFiles(context: RepositoryContext) {
	const [site, profile, announcement, sponsor] = await Promise.all([
		readFile(context, CONFIG_PATHS.site),
		readFile(context, CONFIG_PATHS.profile),
		readFile(context, CONFIG_PATHS.announcement),
		readFile(context, CONFIG_PATHS.sponsor),
	]);
	return { site, profile, announcement, sponsor };
}

export async function loadSiteSettings(context: RepositoryContext): Promise<{ settings: SiteSettings; revision: Record<string, string | null> }> {
	const files = await loadFiles(context);
	return {
		settings: parseSettings(files.site.content, files.profile.content, files.announcement.content, files.sponsor.content),
		revision: Object.fromEntries(Object.values(files).map((file) => [file.path, file.sha || null])),
	};
}

export async function buildSettingsChanges(context: RepositoryContext, input: unknown): Promise<GitChange[]> {
	const settings = validateSettings(input);
	const files = await loadFiles(context);
	return applySettings(files, settings).map((file) => ({ path: file.path, content: file.content }));
}
