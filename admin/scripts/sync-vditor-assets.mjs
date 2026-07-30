import { cpSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const packageRoot = resolve(import.meta.dirname, "../node_modules/vditor");
const targetRoot = resolve(import.meta.dirname, "../public/vendor/vditor");
const licenseSource = resolve(import.meta.dirname, "../node_modules/vditor/LICENSE");
const licenseTarget = resolve(import.meta.dirname, "../public/vendor/vditor/LICENSE");
const runtimeEntries = [
	"dist/index.css",
	"dist/index.min.js",
	"dist/css",
	"dist/images",
	"dist/js",
];

// Vditor 会懒加载运行时资源；只同步浏览器需要的目录，避免把类型声明等开发文件部署到线上。
rmSync(targetRoot, { force: true, recursive: true });
mkdirSync(resolve(targetRoot, "dist"), { recursive: true });
for (const entry of runtimeEntries) {
	const source = resolve(packageRoot, entry);
	const target = resolve(targetRoot, entry);
	cpSync(source, target, { recursive: true });
}
cpSync(licenseSource, licenseTarget);

console.log("Vditor 静态资源已同步。");
