import { HttpError } from "./response";
import type { GitFile } from "./github";

export interface SiteSettings {
	title: string;
	subtitle: string;
	siteUrl: string;
	description: string;
	profileName: string;
	profileBio: string;
	githubUrl: string;
	pages: Record<string, boolean>;
	announcement: string;
	announcementLink: string;
	sponsorMethods: SponsorMethodInput[];
}

export interface SponsorMethodInput {
	name: string;
	icon: string;
	qrCode: string;
	link: string;
	description: string;
}

export interface ArticleInput {
	title: string;
	description: string;
	category: string;
	tags: string[];
	slug?: string;
	directory?: string;
	image?: string;
	published?: string;
	originalPath?: string;
	content: string;
}

function jsonString(value: string): string {
	return JSON.stringify(value.trim());
}

const STRING_LITERAL_PATTERN = `(?:"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')`;

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function configKeyPattern(key: string): string {
	const escaped = escapeRegExp(key);
	return `(?:${escaped}|["']${escaped}["'])`;
}

function parseStringLiteral(value: string): string {
	if (value.startsWith('"')) {
		try {
			return JSON.parse(value) as string;
		} catch {
			return value.slice(1, -1);
		}
	}
	return value.slice(1, -1).replace(/\\(['\\])/g, "$1").replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t");
}

function readString(source: string, key: string, fallback = ""): string {
	const match = source.match(new RegExp(`^[\\t ]*${configKeyPattern(key)}[\\t ]*:[\\t ]*(${STRING_LITERAL_PATTERN})`, "m"));
	if (!match) return fallback;
	return parseStringLiteral(match[1]);
}

function replaceString(source: string, key: string, value: string): string {
	const pattern = new RegExp(`(^[\\t ]*${configKeyPattern(key)}[\\t ]*:[\\t ]*)(${STRING_LITERAL_PATTERN})`, "m");
	if (!pattern.test(source)) throw new HttpError(500, "CONFIG_SHAPE_CHANGED", `配置字段 ${key} 不存在，无法安全更新。`);
	return source.replace(pattern, (_match, prefix: string) => `${prefix}${jsonString(value)}`);
}

interface DelimitedBlock {
	start: number;
	end: number;
	indent: string;
}

function findDelimitedBlock(source: string, key: string, open: "{" | "[", close: "}" | "]"): DelimitedBlock | null {
	const match = new RegExp(`^[\\t ]*${configKeyPattern(key)}[\\t ]*:[\\t ]*\\${open}`, "m").exec(source);
	if (!match) return null;
	const start = source.indexOf(open, match.index);
	let depth = 0;
	let quote = "";
	for (let index = start; index < source.length; index += 1) {
		const character = source[index];
		if (quote) {
			if (character === "\\") index += 1;
			else if (character === quote) quote = "";
			continue;
		}
		if (character === '"' || character === "'" || character === "`") quote = character;
		else if (character === open) depth += 1;
		else if (character === close && --depth === 0) {
			return { start, end: index + 1, indent: match[0].match(/^[\\t ]*/)?.[0] || "" };
		}
	}
	return null;
}

function replaceBooleanInPages(source: string, key: string, value: boolean): string {
	const pages = findDelimitedBlock(source, "pages", "{", "}");
	if (!pages) throw new HttpError(500, "CONFIG_SHAPE_CHANGED", "站点页面开关配置结构发生变化，无法安全更新。");
	const before = source.slice(0, pages.start);
	const block = source.slice(pages.start, pages.end);
	const after = source.slice(pages.end);
	const pattern = new RegExp(`(^[\\t ]*${configKeyPattern(key)}[\\t ]*:[\\t ]*)(true|false)`, "m");
	if (!pattern.test(block)) throw new HttpError(500, "CONFIG_SHAPE_CHANGED", `页面开关 ${key} 不存在，无法安全更新。`);
	return before + block.replace(pattern, (_match, prefix: string) => `${prefix}${value}`) + after;
}

function parseSponsorMethods(source: string): SponsorMethodInput[] {
	const methods = findDelimitedBlock(source, "methods", "[", "]");
	if (!methods) return [];
	const arraySource = source.slice(methods.start, methods.end);
	try {
		const parsed = JSON.parse(arraySource) as Array<Partial<SponsorMethodInput>>;
		return parsed.map((item) => ({
			name: String(item.name || ""),
			icon: String(item.icon || ""),
			qrCode: String(item.qrCode || ""),
			link: String(item.link || ""),
			description: String(item.description || ""),
		}));
	} catch {
		return (arraySource.match(/\{[\s\S]*?\}/g) || []).map((item) => ({
			name: readString(item, "name"),
			icon: readString(item, "icon"),
			qrCode: readString(item, "qrCode"),
			link: readString(item, "link"),
			description: readString(item, "description"),
		})).filter((item) => item.name);
	}
}

export function parseSettings(site: string, profile: string, announcement: string, sponsor: string): SiteSettings {
	const pages: Record<string, boolean> = {};
	const pagesBlock = findDelimitedBlock(site, "pages", "{", "}");
	const pagesSource = pagesBlock ? site.slice(pagesBlock.start, pagesBlock.end) : "";
	for (const page of ["friends", "sponsor", "guestbook", "bangumi", "gallery", "anime", "dynamic"]) {
		const match = pagesSource.match(new RegExp(`^[\\t ]*${configKeyPattern(page)}[\\t ]*:[\\t ]*(true|false)`, "m"));
		pages[page] = match?.[1] === "true";
	}
	const githubBlock = profile.match(new RegExp(`\\{[^}]*${configKeyPattern("name")}[\\t ]*:[\\t ]*["']GitHub["'][^}]*${configKeyPattern("url")}[\\t ]*:[\\t ]*(${STRING_LITERAL_PATTERN})`, "m"));
	return {
		title: readString(site, "title"),
		subtitle: readString(site, "subtitle"),
		siteUrl: readString(site, "site_url"),
		description: readString(site, "description"),
		profileName: readString(profile, "name"),
		profileBio: readString(profile, "bio"),
		githubUrl: githubBlock ? parseStringLiteral(githubBlock[1]) : "",
		pages,
		announcement: readString(announcement, "content"),
		announcementLink: readString(announcement, "url", "/about/"),
		sponsorMethods: parseSponsorMethods(sponsor),
	};
}

export function updateSiteConfig(source: string, input: SiteSettings): string {
	let updated = replaceString(source, "title", input.title);
	updated = replaceString(updated, "subtitle", input.subtitle);
	updated = replaceString(updated, "site_url", input.siteUrl);
	updated = replaceString(updated, "description", input.description);
	for (const [key, value] of Object.entries(input.pages)) updated = replaceBooleanInPages(updated, key, Boolean(value));
	return updated;
}

export function updateProfileConfig(source: string, input: SiteSettings): string {
	let updated = replaceString(source, "name", input.profileName);
	updated = replaceString(updated, "bio", input.profileBio);
	const github = new RegExp(`(\\{[^}]*${configKeyPattern("name")}[\\t ]*:[\\t ]*["']GitHub["'][^}]*^[\\t ]*${configKeyPattern("url")}[\\t ]*:[\\t ]*)(${STRING_LITERAL_PATTERN})`, "m");
	if (github.test(updated)) updated = updated.replace(github, (_match, prefix: string) => `${prefix}${jsonString(input.githubUrl)}`);
	return updated;
}

export function updateAnnouncementConfig(source: string, input: SiteSettings): string {
	let updated = replaceString(source, "content", input.announcement);
	updated = replaceString(updated, "url", input.announcementLink || "/about/");
	return updated;
}

export function applySettings(
	current: { site: GitFile; profile: GitFile; announcement: GitFile; sponsor: GitFile },
	input: SiteSettings,
): GitFile[] {
	return [
		{ path: current.site.path, content: updateSiteConfig(current.site.content, input), sha: current.site.sha },
		{ path: current.profile.path, content: updateProfileConfig(current.profile.content, input), sha: current.profile.sha },
		{ path: current.announcement.path, content: updateAnnouncementConfig(current.announcement.content, input), sha: current.announcement.sha },
		{ path: current.sponsor.path, content: updateSponsorConfig(current.sponsor.content, input.sponsorMethods), sha: current.sponsor.sha },
	];
}

function cleanSponsorMethods(methods: SponsorMethodInput[]) {
	return methods.filter((method) => method.name.trim()).map((method) => ({
			name: method.name.trim(),
			icon: method.icon.trim(),
			qrCode: method.qrCode.trim(),
			link: method.link.trim(),
			description: method.description.trim(),
			enabled: true,
		}));
}

export function updateSponsorConfig(source: string, methods: SponsorMethodInput[]): string {
	const block = findDelimitedBlock(source, "methods", "[", "]");
	if (!block) throw new HttpError(500, "CONFIG_SHAPE_CHANGED", "打赏方式配置结构发生变化，无法安全更新。");
	const lines = JSON.stringify(cleanSponsorMethods(methods), null, "\t").split("\n");
	const formatted = lines.map((line, index) => (index === 0 ? line : `${block.indent}${line}`)).join("\n");
	return source.slice(0, block.start) + formatted + source.slice(block.end);
}

export function buildSponsorConfig(methods: SponsorMethodInput[]): string {
	const clean = cleanSponsorMethods(methods);
	return `import type { SponsorConfig } from "../types/sponsorConfig";\n\nexport const sponsorConfig: SponsorConfig = {\n\ttitle: "",\n\tdescription: "",\n\tusage: "",\n\tshowSponsorsList: true,\n\tshowComment: false,\n\tshowButtonInPost: false,\n\t// 由后台生成个人收款方式；不会写入模板作者的收款信息。\n\tmethods: ${JSON.stringify(clean, null, 2).replace(/^/gm, "\t")},\n\tsponsors: [],\n};\n`;
}

function slugify(value: string): string {
	const slug = value.toLowerCase().trim().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "");
	return slug || `post-${Date.now()}`;
}

function normalizeDirectory(value: string | undefined): string {
	const directory = (value || "").trim().replace(/^\/+|\/+$/g, "");
	if (!directory) return "";
	if (directory.length > 240 || directory.split("/").some((part) => !part || part === "." || part === ".." || !/^[a-z0-9\u4e00-\u9fff_-]+$/i.test(part))) {
		throw new HttpError(400, "ARTICLE_DIRECTORY_INVALID", "文章目录只能包含字母、数字、中文、短横线、下划线和斜杠。");
	}
	return directory;
}

function normalizePublished(value: string | undefined): string {
	const published = (value || new Date().toISOString().slice(0, 10)).trim();
	if (!/^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/.test(published)) {
		throw new HttpError(400, "ARTICLE_DATE_INVALID", "发布时间格式无效。");
	}
	return published;
}

export function buildArticle(input: ArticleInput): { path: string; content: string; slug: string } {
	const title = input.title.trim();
	const content = input.content.trim();
	if (!title || !content) throw new HttpError(400, "ARTICLE_REQUIRED", "文章标题和正文不能为空。原因：空文章无法生成有效页面。`content` 应包含 Markdown 正文。");
	if (title.length > 120 || content.length > 120_000) throw new HttpError(400, "ARTICLE_TOO_LARGE", "文章标题或正文超出限制，请缩短内容后重试。");
	const slug = slugify(input.slug || title);
	const directory = normalizeDirectory(input.directory);
	const tags = Array.isArray(input.tags) ? input.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean).slice(0, 12) : [];
	const description = typeof input.description === "string" ? input.description.trim().slice(0, 240) : "";
	const category = typeof input.category === "string" ? input.category.trim() : "";
	const image = typeof input.image === "string" ? input.image.trim().slice(0, 500) : "";
	const frontmatter = [
			"---",
			`title: ${jsonString(title)}`,
			`description: ${jsonString(description)}`,
			`published: ${normalizePublished(input.published)}`,
			`tags: ${JSON.stringify(tags)}`,
			`category: ${jsonString(category || "未分类")}`,
			...(image ? [`image: ${jsonString(image)}`] : []),
			`slug: ${jsonString(slug)}`,
		"---",
		"",
		content,
		"",
	].join("\n");
	return { path: `src/content/posts/${directory ? `${directory}/` : ""}${slug}.md`, content: frontmatter, slug };
}
