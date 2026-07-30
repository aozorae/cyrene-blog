import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const adminRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = join(adminRoot, "public");

function walk(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return entry.name === "vendor" ? [] : walk(path);
		return [path];
	});
}

const files = walk(publicRoot);
const scripts = files.filter((path) => extname(path) === ".js");
const pages = files.filter((path) => extname(path) === ".html");
const styles = files.filter((path) => extname(path) === ".css");
const errors = [];

function localAssetTarget(sourceFile, reference) {
	if (!reference || /^(?:https?:|data:|mailto:|tel:|#)/.test(reference)) return null;
	const clean = reference.split(/[?#]/, 1)[0];
	if (!clean) return null;
	return clean.startsWith("/")
		? join(publicRoot, clean.replace(/^\//, ""))
		: resolve(dirname(sourceFile), clean);
}

function validateReference(sourceFile, reference) {
	const target = localAssetTarget(sourceFile, reference);
	if (target && (!existsSync(target) || !statSync(target).isFile())) {
		errors.push(`${sourceFile} 引用了不存在的静态资源 ${reference}。`);
	}
}

for (const script of scripts) {
	const syntax = spawnSync(process.execPath, ["--check", script], { encoding: "utf8" });
	if (syntax.status !== 0) errors.push(syntax.stderr.trim() || `${script} 语法检查失败。`);
	const source = readFileSync(script, "utf8");
	for (const match of source.matchAll(/(?:from\s+|import\s*)["'](\.{1,2}\/[^"']+)["']/g)) {
		const target = resolve(dirname(script), match[1]);
		if (!existsSync(target) || !statSync(target).isFile()) {
			errors.push(`${script} 引用了不存在的模块 ${match[1]}。`);
		}
	}
}

for (const page of pages) {
	const source = readFileSync(page, "utf8");
	for (const match of source.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
		validateReference(page, match[1]);
	}
	if (!source.includes('type="module"')) errors.push(`${page} 缺少页面模块入口。`);
}

for (const style of styles) {
	const source = readFileSync(style, "utf8");
	for (const match of source.matchAll(/@import\s+(?:url\()?\s*["']([^"']+)["']/g)) {
		validateReference(style, match[1]);
	}
}

if (errors.length) {
	console.error(errors.join("\n"));
	process.exit(1);
}

console.log(`前端结构检查通过：${pages.length} 个页面，${scripts.length} 个 JavaScript 模块，${styles.length} 个样式文件。`);
