import { EN_TRANSLATIONS } from "./translations-en.js";

const LANGUAGE_STORAGE_KEY = "cyrene-admin-language";
const DEFAULT_LANGUAGE = "zh-CN";
const SUPPORTED_LANGUAGES = new Set([DEFAULT_LANGUAGE, "en"]);
const TRANSLATABLE_ATTRIBUTES = ["aria-label", "placeholder", "title"];
const SKIPPED_ELEMENTS = new Set(["CODE", "PRE", "SCRIPT", "STYLE", "TEXTAREA"]);

let observer = null;
let confirmWrapped = false;

export function getLanguage() {
	let stored = null;
	try {
		stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
	} catch {
		stored = document.cookie
			.split(";")
			.map((part) => part.trim())
			.find((part) => part.startsWith(`${LANGUAGE_STORAGE_KEY}=`))
			?.split("=")[1];
	}
	return SUPPORTED_LANGUAGES.has(stored) ? stored : DEFAULT_LANGUAGE;
}

export function getLocale() {
	return getLanguage() === "en" ? "en-US" : "zh-CN";
}

export function isEnglish() {
	return getLanguage() === "en";
}

function preserveWhitespace(source, translated) {
	const leading = source.match(/^\s*/)?.[0] || "";
	const trailing = source.match(/\s*$/)?.[0] || "";
	return `${leading}${translated}${trailing}`;
}

function translatePattern(value) {
	let match = value.match(/^([\s\S]+)\n\n是否强制覆盖 GitHub 中的最新内容？$/);
	if (match) return `${translateText(match[1])}\n\nForce overwrite the latest content on GitHub?`;

	match = value.match(/^确定删除(.+)吗？删除会立即创建 GitHub 提交。$/);
	if (match) return `Delete ${translateText(match[1])}? This immediately creates a GitHub commit.`;

	match = value.match(/^编辑：(.+)$/);
	if (match) return `Edit: ${match[1]}`;

	match = value.match(/^动态 (.+)$/);
	if (match) return `Update ${match[1]}`;

	match = value.match(/^项目 (\d+)$/);
	if (match) return `Item ${match[1]}`;

	match = value.match(/^(\d+) 项资源$/);
	if (match) return `${match[1]} resources`;

	match = value.match(/^(\d+) 段视频$/);
	if (match) return `${match[1]} videos`;

	match = value.match(/^(\d+) 条内容$/);
	if (match) return `${match[1]} entries`;

	match = value.match(/^连接 GitHub 仓库：(.+)$/);
	if (match) return `Connected GitHub repository: ${match[1]}`;

	match = value.match(/^当前值：(.+)$/);
	if (match) return `Current value: ${match[1]}`;

	match = value.match(/^(收起|展开)“(.+)”的详细设置$/);
	if (match) return `${match[1] === "收起" ? "Collapse" : "Expand"} details for “${match[2]}”`;

	match = value.match(/^(.+) · 高度 (.+)$/);
	if (match) return `${translateText(match[1])} · Height ${translateText(match[2])}`;

	match = value.match(/^(.+) · 间隔 (.+)$/);
	if (match) return `${translateText(match[1])} · Interval ${translateText(match[2])}`;

	match = value.match(/^(.+) · (\d+) 项设置$/);
	if (match) return `${translateText(match[1])} · ${match[2]} settings`;

	match = value.match(/^(\d+(?:\.\d+)?) 秒$/);
	if (match) return `${match[1]} seconds`;

	match = value.match(/^(\d+(?:\.\d+)?) 毫秒$/);
	if (match) return `${match[1]} ms`;

	match = value.match(/^高级配置参数“(.+)”。请保留此名称以便与主题配置核对。$/);
	if (match) {
		return `Advanced configuration parameter “${match[1]}”. Keep this name to verify it against the theme configuration.`;
	}

	return value;
}

export function translateText(value) {
	const source = String(value ?? "");
	if (!isEnglish() || !source.trim()) return source;
	const trimmed = source.trim();
	const translated = EN_TRANSLATIONS[trimmed] || translatePattern(trimmed);
	return translated === trimmed ? source : preserveWhitespace(source, translated);
}

function shouldSkip(node) {
	const parent = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
	return (
		!parent ||
		SKIPPED_ELEMENTS.has(parent.tagName) ||
		parent.closest("[data-i18n-ignore]")
	);
}

function translateAttributes(element) {
	if (element.closest("[data-i18n-ignore]")) return;
	for (const attribute of TRANSLATABLE_ATTRIBUTES) {
		if (!element.hasAttribute(attribute)) continue;
		const source = element.getAttribute(attribute);
		const translated = translateText(source);
		if (translated !== source) element.setAttribute(attribute, translated);
	}
}

function translateElement(root) {
	if (!isEnglish() || !root || shouldSkip(root)) return;
	if (root.nodeType === Node.TEXT_NODE) {
		const translated = translateText(root.nodeValue);
		if (translated !== root.nodeValue) root.nodeValue = translated;
		return;
	}

	if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
	if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root);
	root.querySelectorAll?.("[aria-label], [placeholder], [title]").forEach(translateAttributes);

	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	let node = walker.nextNode();
	while (node) {
		if (!shouldSkip(node)) {
			const translated = translateText(node.nodeValue);
			if (translated !== node.nodeValue) node.nodeValue = translated;
		}
		node = walker.nextNode();
	}
}

function observeTranslations() {
	if (observer || !document.body) return;
	observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type === "characterData") translateElement(mutation.target);
			for (const node of mutation.addedNodes) translateElement(node);
		}
	});
	observer.observe(document.body, { characterData: true, childList: true, subtree: true });
}

function wrapConfirm() {
	if (confirmWrapped) return;
	const nativeConfirm = window.confirm.bind(window);
	window.confirm = (message) => nativeConfirm(translateText(message));
	confirmWrapped = true;
}

export function initializeI18n() {
	document.documentElement.lang = getLanguage();
	document.title = translateText(document.title);
	translateElement(document.body);
	observeTranslations();
	wrapConfirm();
}

export function bindLanguageToggle(button) {
	if (!button || button.dataset.languageToggleBound === "true") return;
	const nextLanguage = isEnglish() ? DEFAULT_LANGUAGE : "en";
	const label = isEnglish() ? "Switch to Chinese" : "切换为英文";
	button.title = label;
	button.setAttribute("aria-label", label);
	button.querySelector("[data-language-code]")?.replaceChildren(isEnglish() ? "中" : "EN");
	button.dataset.languageToggleBound = "true";
	button.addEventListener("click", () => {
		try {
			window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
		} catch {
			document.cookie = `${LANGUAGE_STORAGE_KEY}=${nextLanguage}; Path=/; SameSite=Lax`;
		}
		window.location.reload();
	});
}
