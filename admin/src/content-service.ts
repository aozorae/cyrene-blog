import { buildArticle, type ArticleInput } from "./config-editor";
import { listFiles, readFile, type GitChange } from "./github";
import { HttpError } from "./response";
import type { RepositoryContext } from "./types";

export interface PublishedContent {
	path: string;
	sha: string;
	title: string;
	description: string;
	published: string;
	content: string;
	extension: "md" | "mdx";
	editable: boolean;
}

export interface ArticleDocument extends PublishedContent {
	source: string;
	category: string;
	tags: string[];
	slug: string;
	directory: string;
	image: string;
}

export interface DynamicInput {
	content?: unknown;
	published?: unknown;
}

function validateArticleInput(input: unknown): ArticleInput {
	if (!input || typeof input !== "object" || Array.isArray(input)) throw new HttpError(400, "ARTICLE_INVALID", "文章草稿格式无效。");
	const value = input as Record<string, unknown>;
	if (typeof value.title !== "string" || typeof value.content !== "string") throw new HttpError(400, "ARTICLE_INVALID", "文章标题和正文格式无效。");
	if (!Array.isArray(value.tags) || !value.tags.every((tag) => typeof tag === "string")) throw new HttpError(400, "ARTICLE_INVALID", "文章标签格式无效。");
	for (const key of ["description", "category", "slug", "directory", "image", "published", "originalPath"] as const) {
		if (value[key] !== undefined && typeof value[key] !== "string") throw new HttpError(400, "ARTICLE_INVALID", `文章字段 ${key} 格式无效。`);
	}
	return value as unknown as ArticleInput;
}

function unquote(value: string): string {
	const trimmed = value.trim();
	if (trimmed.startsWith('"')) {
		try {
			return JSON.parse(trimmed) as string;
		} catch {
			return trimmed.slice(1, -1);
		}
	}
	if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1).replace(/''/g, "'");
	return trimmed;
}

function parseFrontmatter(source: string): { values: Record<string, string>; body: string } {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return { values: {}, body: source.trim() };
	const values: Record<string, string> = {};
	for (const line of match[1].split(/\r?\n/)) {
		const item = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
		if (item) values[item[1]] = item[2];
	}
	return { values, body: source.slice(match[0].length).trim() };
}

function parseTags(value: string | undefined): string[] {
	if (!value) return [];
	try {
		const parsed = JSON.parse(value) as unknown;
		return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
	} catch {
		return value.replace(/^\[|\]$/g, "").split(",").map((item) => unquote(item)).filter(Boolean);
	}
}

function contentExtension(path: string): "md" | "mdx" {
	return path.endsWith(".mdx") ? "mdx" : "md";
}

function toPublishedContent(path: string, sha: string, source: string): PublishedContent {
	const { values, body } = parseFrontmatter(source);
	const extension = contentExtension(path);
	return {
		path,
		sha,
		title: unquote(values.title || path.split("/").pop()?.replace(/\.mdx?$/, "") || ""),
		description: unquote(values.description || ""),
		published: unquote(values.published || ""),
		content: body,
		extension,
		editable: extension === "md",
	};
}

function validateContentPath(path: string, directory: "posts" | "dynamic"): string {
	const prefix = `src/content/${directory}/`;
	if (!path.startsWith(prefix) || path.includes("..") || path.includes("\\") || !/\.mdx?$/.test(path)) {
		throw new HttpError(400, "CONTENT_PATH_INVALID", "内容路径格式无效。");
	}
	return path;
}

export async function listPublishedContent(context: RepositoryContext, directory: "posts" | "dynamic"): Promise<PublishedContent[]> {
	const files = (await listFiles(context, `src/content/${directory}`))
		.filter((item) => /\.mdx?$/.test(item.path))
		.slice(0, 120);
	const records = await Promise.all(files.map(async (item) => {
		const file = await readFile(context, item.path);
		return toPublishedContent(item.path, file.sha || item.sha, file.content);
	}));
	return records.sort((a, b) => b.path.localeCompare(a.path));
}

export async function readArticle(context: RepositoryContext, path: string): Promise<ArticleDocument> {
	validateContentPath(path, "posts");
	const file = await readFile(context, path);
	const base = toPublishedContent(file.path, file.sha || "", file.content);
	const { values } = parseFrontmatter(file.content);
	const relative = file.path.slice("src/content/posts/".length).replace(/\.mdx?$/, "");
	const parts = relative.split("/");
	return {
		...base,
		source: file.content,
		category: unquote(values.category || ""),
		tags: parseTags(values.tags),
		slug: unquote(values.slug || parts.at(-1) || ""),
		directory: parts.slice(0, -1).join("/"),
		image: unquote(values.image || ""),
	};
}

export function articleChanges(rawInput: unknown): { changes: GitChange[]; path: string } {
	const input = validateArticleInput(rawInput);
	const built = buildArticle(input);
	const originalPath = typeof input.originalPath === "string" ? input.originalPath.trim() : "";
	if (originalPath) validateContentPath(originalPath, "posts");
	const changes: GitChange[] = [];
	if (originalPath && originalPath !== built.path) changes.push({ path: originalPath, content: null });
	changes.push({ path: built.path, content: built.content });
	return { changes, path: built.path };
}

export function buildDynamic(input: DynamicInput): { path: string; content: string } {
	const content = typeof input.content === "string" ? input.content.trim() : "";
	if (!content) throw new HttpError(400, "DYNAMIC_REQUIRED", "动态内容不能为空。");
	if (content.length > 120_000) throw new HttpError(400, "DYNAMIC_TOO_LARGE", "动态内容超出限制，请缩短后重试。");
	const requestedDate = typeof input.published === "string" ? input.published.trim() : "";
	const date = requestedDate || new Date().toISOString().slice(0, 19).replace("T", " ");
	if (!/^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/.test(date)) throw new HttpError(400, "DYNAMIC_DATE_INVALID", "动态发布时间格式无效。");
	const digits = date.replace(/\D/g, "");
	const fallback = new Date().toISOString().replace(/\D/g, "");
	const stamp = (digits.length >= 14 ? digits : fallback).slice(0, 14);
	const filename = `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}-${stamp.slice(8, 14)}`;
	return { path: `src/content/dynamic/${filename}.md`, content: `---\npublished: ${date}\n---\n\n${content}\n` };
}

export function validateDeletePath(path: string, directory: "posts" | "dynamic"): string {
	return validateContentPath(path, directory);
}
