import { HttpError } from "./response";
import { readFile, type GitChange, type GitFile } from "./github";
import type { RepositoryContext } from "./types";

/**
 * 配置工作室只允许访问白名单文件；这样即使后台请求被伪造，也不会变成任意文件读写接口。
 * 这些文件都是 Firefly 文档中公开说明的配置入口，保存时只替换 export const 的值，尽量保留原有注释。
 */
export const STUDIO_CONFIGS = [
	{ path: "src/config/siteConfig.ts", title: "站点与文章显示", description: "站点标题、主题色、文章列表、页面开关和图片优化。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/site.html" },
	{ path: "src/config/profileConfig.ts", title: "个人资料与链接", description: "头像、个人签名以及个人链接。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/profile.html" },
	{ path: "src/config/navBarConfig.ts", title: "导航栏", description: "导航菜单、Logo 和顶部交互。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/navbar.html" },
	{ path: "src/config/sidebarConfig.ts", title: "侧边栏", description: "左右侧边栏组件、顺序和移动端组件。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/sidebar.html" },
	{ path: "src/config/announcementConfig.ts", title: "公告", description: "首页公告内容与跳转链接。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/announcement.html" },
	{ path: "src/config/backgroundWallpaper.ts", title: "背景壁纸", description: "桌面/移动背景、视频、轮播与透明度。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/wallpaper.html" },
	{ path: "src/config/musicConfig.ts", title: "音乐播放器", description: "音乐服务、播放列表和播放器行为。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/music.html" },
	{ path: "src/config/commentConfig.ts", title: "评论系统", description: "Twikoo、Waline、Giscus、Disqus 和 Artalk。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/comment.html" },
	{ path: "src/config/analyticsConfig.ts", title: "统计分析", description: "Google Analytics、Umami、Clarity 和 51.la。" },
	{ path: "src/config/fontConfig.ts", title: "字体", description: "全局字体、代码字体和字体子集化。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/font.html" },
	{ path: "src/config/coverImageConfig.ts", title: "文章封面", description: "文章封面图和随机图片 API。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/cover-image.html" },
	{ path: "src/config/dynamicConfig.ts", title: "动态页面", description: "动态页面标题、评论和分页。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/dynamic.html" },
	{ path: "src/config/friendsConfig.ts", title: "友链", description: "友链页面和友链列表。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/friends.html" },
	{ path: "src/config/galleryConfig.ts", title: "相册", description: "相册页面的展示和数据源。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/gallery.html" },
	{ path: "src/config/sponsorConfig.ts", title: "打赏", description: "打赏方式与打赏页面行为。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/sponsor.html" },
	{ path: "src/config/effectsConfig.ts", title: "特效", description: "樱花等视觉特效。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/effects.html" },
	{ path: "src/config/expressiveCodeConfig.ts", title: "代码块", description: "代码主题、折叠和语言徽章。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/code-block.html" },
	{ path: "src/config/mermaidConfig.ts", title: "Mermaid 图表", description: "Mermaid 图表主题和渲染开关。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/mermaid.html" },
	{ path: "src/config/plantumlConfig.ts", title: "PlantUML 图表", description: "PlantUML 服务器和明暗主题。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/plantuml.html" },
	{ path: "src/config/pioConfig.ts", title: "看板娘", description: "Live2D/Spine 模型、菜单和提示语。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/pio.html" },
	{ path: "src/config/footerConfig.ts", title: "页脚", description: "页脚 HTML 注入开关。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/footer.html" },
	{ path: "src/config/licenseConfig.ts", title: "许可证", description: "文章许可证与版权信息。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/license.html" },
	{ path: "src/config/FooterConfig.html", title: "页脚 HTML", description: "页脚自定义 HTML 内容。", docsUrl: "https://docs-firefly.cuteleaf.cn/zh/guide/footer.html", text: true },
] as const;

export type StudioConfig = (typeof STUDIO_CONFIGS)[number];

interface ParsedExport {
	name: string;
	start: number;
	end: number;
	value: unknown;
}

class ValueParser {
	private index = 0;

	constructor(private readonly source: string) {}

	parse(): { value: unknown; end: number } {
		this.skipTrivia();
		const value = this.parseValue();
		this.skipTrivia();
		return { value, end: this.index };
	}

	private skipTrivia(): void {
		while (this.index < this.source.length) {
			const rest = this.source.slice(this.index);
			const whitespace = rest.match(/^\s+/);
			if (whitespace) {
				this.index += whitespace[0].length;
				continue;
			}
			if (rest.startsWith("//")) {
				const newline = this.source.indexOf("\n", this.index + 2);
				this.index = newline < 0 ? this.source.length : newline + 1;
				continue;
			}
			if (rest.startsWith("/*")) {
				const close = this.source.indexOf("*/", this.index + 2);
				if (close < 0) throw new HttpError(500, "CONFIG_PARSE_ERROR", "配置文件中的注释没有正确闭合。");
				this.index = close + 2;
				continue;
			}
			break;
		}
	}

	private parseValue(): unknown {
		this.skipTrivia();
		const char = this.source[this.index];
		if (char === "{" ) return this.parseObject();
		if (char === "[") return this.parseArray();
		if (char === '"' || char === "'" || char === "`") {
			const value = this.parseString();
			this.skipAssertion();
			return value;
		}
		const number = this.source.slice(this.index).match(/^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);
		if (number) {
			this.index += number[0].length;
			this.skipAssertion();
			return Number(number[0]);
		}
		const word = this.source.slice(this.index).match(/^[A-Za-z_$][\w$-]*/);
		if (!word) throw new HttpError(500, "CONFIG_PARSE_ERROR", "配置文件包含暂不支持的表达式，请保留原文件并联系管理员。");
		this.index += word[0].length;
		let expression = word[0];
		while (this.source[this.index] === ".") {
			const member = this.source.slice(this.index + 1).match(/^[A-Za-z_$][\w$]*/);
			if (!member) break;
			this.index += member[0].length + 1;
			expression += `.${member[0]}`;
		}
		this.skipAssertion();
		if (expression === "true") return true;
		if (expression === "false") return false;
		if (expression === "null" || expression === "undefined") return null;
		return expression;
	}

	private parseString(): string {
		const quote = this.source[this.index++];
		let output = "";
		while (this.index < this.source.length) {
			const char = this.source[this.index++];
			if (char === quote) return output;
			if (char === "\\") {
				const escaped = this.source[this.index++];
				output += escaped === "n" ? "\n" : escaped === "r" ? "\r" : escaped === "t" ? "\t" : escaped;
			} else output += char;
		}
		throw new HttpError(500, "CONFIG_PARSE_ERROR", "配置文件中的字符串没有正确闭合。");
	}

	private parseObject(): Record<string, unknown> {
		this.index += 1;
		const result: Record<string, unknown> = {};
		this.skipTrivia();
		while (this.index < this.source.length && this.source[this.index] !== "}") {
			const key = this.parseKey();
			this.skipTrivia();
			if (this.source[this.index++] !== ":") throw new HttpError(500, "CONFIG_PARSE_ERROR", "配置对象缺少冒号，无法安全读取。");
			result[key] = this.parseValue();
			this.skipTrivia();
			if (this.source[this.index] === ",") {
				this.index += 1;
				this.skipTrivia();
			}
		}
		if (this.source[this.index] !== "}") throw new HttpError(500, "CONFIG_PARSE_ERROR", "配置对象没有正确闭合。");
		this.index += 1;
		this.skipAssertion();
		return result;
	}

	private parseArray(): unknown[] {
		this.index += 1;
		const result: unknown[] = [];
		this.skipTrivia();
		while (this.index < this.source.length && this.source[this.index] !== "]") {
			result.push(this.parseValue());
			this.skipTrivia();
			if (this.source[this.index] === ",") {
				this.index += 1;
				this.skipTrivia();
			}
		}
		if (this.source[this.index] !== "]") throw new HttpError(500, "CONFIG_PARSE_ERROR", "配置数组没有正确闭合。");
		this.index += 1;
		this.skipAssertion();
		return result;
	}

	private parseKey(): string {
		this.skipTrivia();
		const char = this.source[this.index];
		if (char === '"' || char === "'") return this.parseString();
		const word = this.source.slice(this.index).match(/^[A-Za-z_$][\w$-]*/);
		if (!word) throw new HttpError(500, "CONFIG_PARSE_ERROR", "配置对象包含无法识别的字段名。");
		this.index += word[0].length;
		return word[0];
	}

	private skipAssertion(): void {
		this.skipTrivia();
		if (this.source.slice(this.index).startsWith("as ")) {
			this.index += 3;
			const word = this.source.slice(this.index).match(/^[A-Za-z_$][\w$]*/);
			if (word) this.index += word[0].length;
		}
		this.skipTrivia();
	}
}

function parseExports(source: string): ParsedExport[] {
	const result: ParsedExport[] = [];
	const pattern = /export\s+const\s+([A-Za-z_$][\w$]*)\s*(?::[^=;]+)?=\s*/g;
	let match: RegExpExecArray | null;
	while ((match = pattern.exec(source))) {
		const start = match.index;
		const expressionStart = pattern.lastIndex;
		const first = source[expressionStart];
		// 配置文件中偶尔会同时导出运行时函数（例如导航栏构建函数）；这些不是用户配置，跳过以避免把函数代码暴露成可编辑内容。
		if (!["{", "[", "\"", "'", "`"].includes(first)) {
			const semicolon = source.indexOf(";", expressionStart);
			pattern.lastIndex = semicolon < 0 ? source.length : semicolon + 1;
			continue;
		}
		const parsed = new ValueParser(source.slice(expressionStart)).parse();
		result.push({ name: match[1], start, end: expressionStart + parsed.end, value: parsed.value });
		pattern.lastIndex = expressionStart + parsed.end;
	}
	return result;
}

function serialize(value: unknown, depth = 0): string {
	if (depth > 12) throw new HttpError(400, "CONFIG_TOO_DEEP", "配置层级过深，无法保存。");
	if (Array.isArray(value)) {
		if (value.length === 0) return "[]";
		return `[\n${value.map((item) => `${"\t".repeat(depth + 1)}${serialize(item, depth + 1)}`).join(",\n")}\n${"\t".repeat(depth)}]`;
	}
	if (value && typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>);
		if (entries.length === 0) return "{}";
		return `{\n${entries.map(([key, item]) => `${"\t".repeat(depth + 1)}${JSON.stringify(key)}: ${serialize(item, depth + 1)}`).join(",\n")}\n${"\t".repeat(depth)}}`;
	}
	if (typeof value === "string") return value === "SITE_LANG" || /^[A-Za-z_$][\w$]*\.[A-Za-z_$][\w$]*$/.test(value) ? value : JSON.stringify(value);
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
	if (typeof value === "boolean") return String(value);
	return "null";
}

function validateStudioValue(value: unknown, depth = 0): void {
	if (depth > 12) throw new HttpError(400, "CONFIG_TOO_DEEP", "配置层级过深，无法保存。");
	if (typeof value === "string" && value.length > 100_000) throw new HttpError(400, "CONFIG_TOO_LARGE", "配置字符串过长，无法保存。");
	if (Array.isArray(value)) {
		if (value.length > 500) throw new HttpError(400, "CONFIG_TOO_LARGE", "配置数组项目过多，无法保存。");
		for (const item of value) validateStudioValue(item, depth + 1);
		return;
	}
	if (value && typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>);
		if (entries.length > 300) throw new HttpError(400, "CONFIG_TOO_LARGE", "配置字段过多，无法保存。");
		for (const [key, item] of entries) {
			if (["__proto__", "prototype", "constructor"].includes(key)) throw new HttpError(400, "CONFIG_FIELD_NOT_ALLOWED", "配置包含不允许的字段名。");
			validateStudioValue(item, depth + 1);
		}
	}
}

function parseDocument(file: GitFile, config: StudioConfig): { path: string; sha: string; title: string; description: string; docsUrl?: string; exports: Record<string, unknown>; text?: boolean } {
	const docsUrl = "docsUrl" in config ? config.docsUrl : undefined;
	if ("text" in config && config.text) return { path: file.path, sha: file.sha || "", title: config.title, description: config.description, docsUrl, exports: { content: file.content }, text: true };
	const exports: Record<string, unknown> = {};
	for (const item of parseExports(file.content)) {
		if (!/^[A-Z_]+$/.test(item.name)) exports[item.name] = item.value;
	}
	if (Object.keys(exports).length === 0) throw new HttpError(500, "CONFIG_PARSE_ERROR", `无法读取配置文件 ${file.path}。`);
	return { path: file.path, sha: file.sha || "", title: config.title, description: config.description, docsUrl, exports };
}

export async function readStudio(context: RepositoryContext): Promise<unknown[]> {
	const files = await Promise.all(STUDIO_CONFIGS.map((config) => readFile(context, config.path)));
	return files.map((file, index) => {
		try {
			return parseDocument(file, STUDIO_CONFIGS[index]);
		} catch (error) {
			if (error instanceof HttpError) throw new HttpError(error.status, error.code, `${STUDIO_CONFIGS[index].path}：${error.message}`);
			throw error;
		}
	});
}

export async function buildStudioChange(context: RepositoryContext, path: string, values: Record<string, unknown>): Promise<{ change: GitChange; sha: string }> {
	validateStudioValue(values);
	if (JSON.stringify(values).length > 250_000) throw new HttpError(413, "CONFIG_TOO_LARGE", "配置内容过大，无法保存。");
	const config = STUDIO_CONFIGS.find((item) => item.path === path);
	if (!config) throw new HttpError(400, "CONFIG_NOT_ALLOWED", "这个配置文件不在可视化管理白名单中。");
	const file = await readFile(context, path);
	if ("text" in config && config.text) {
		if (typeof values.content !== "string" || values.content.length > 100_000) throw new HttpError(400, "CONFIG_INVALID", "页脚内容为空或超出大小限制。");
		return { change: { path, content: values.content }, sha: file.sha || "" };
	}
	const parsed = parseExports(file.content);
	const allowed = new Set(parsed.filter((item) => !/^[A-Z_]+$/.test(item.name)).map((item) => item.name));
	for (const key of Object.keys(values)) if (!allowed.has(key)) throw new HttpError(400, "CONFIG_FIELD_NOT_ALLOWED", `配置字段 ${key} 不允许修改。`);
	const replacements = parsed.filter((item) => Object.prototype.hasOwnProperty.call(values, item.name)).sort((a, b) => b.end - a.end);
	let content = file.content;
	// 上面的替换采用从后往前的范围，避免前一次替换改变后续索引。
	for (const item of replacements) {
		const expressionStart = file.content.indexOf("=", item.start) + 1;
		const leading = file.content.slice(expressionStart, item.end).match(/^\s*/)?.[0] || "";
		content = `${content.slice(0, expressionStart + leading.length)}${serialize(values[item.name])}${content.slice(item.end)}`;
	}
	return { change: { path, content }, sha: file.sha || "" };
}
