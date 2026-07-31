import { api } from "../core/api.js";
import { bindLanguageToggle } from "../core/i18n.js";

const NAVIGATION = [
	{
		label: "概览",
		items: [
			{ id: "dashboard", label: "仪表盘", icon: "layout-dashboard", href: "/dashboard.html" },
			{ id: "article", label: "发布文章", icon: "file-plus-2", href: "/article.html" },
			{ id: "articles", label: "管理内容", icon: "file-text", href: "/articles.html" },
			{ id: "dynamic", label: "发布动态", icon: "message-square-plus", href: "/dynamic.html" },
		],
	},
	{
		label: "配置",
		items: [
			{ id: "studio", group: "foundation", label: "基础配置", icon: "settings-2" },
			{ id: "studio", group: "components", label: "基础组件", icon: "panels-top-left" },
			{ id: "studio", group: "features", label: "功能配置", icon: "sliders-horizontal", pill: "8" },
			{ id: "studio", group: "pages", label: "页面", icon: "files" },
			{ id: "studio", group: "extensions", label: "拓展功能", icon: "puzzle" },
		],
	},
	{
		label: "记录",
		items: [
			{ id: "pending", label: "待提交", icon: "list-checks", href: "/pending.html", draftPill: true },
			{ id: "activity", label: "提交记录", icon: "history", href: "/activity.html" },
		],
	},
];

let activePage = null;

function icon(name) {
	return `<svg class="icon" aria-hidden="true"><use href="/icons.svg#${name}"></use></svg>`;
}

function languageIcon() {
	return '<img class="language-icon" src="/translate.svg" alt="" aria-hidden="true" />';
}

function navigationItem(item) {
	const href = item.href || `/studio.html?group=${encodeURIComponent(item.group)}`;
	const active =
		activePage?.id === item.id &&
		(item.id !== "studio" || activePage.group === item.group);
	const pill = item.draftPill
		? '<span id="draft-count" class="nav-pill">0</span>'
		: item.pill
			? `<span class="nav-pill">${item.pill}</span>`
			: "";
	return `<a class="nav-item ${active ? "active" : ""}" data-navigation-link href="${href}" title="${item.label}">${icon(item.icon)}<span>${item.label}</span>${pill}</a>`;
}

export function mountShell(page) {
	activePage = page;
	const sidebar = document.querySelector("#admin-sidebar");
	const topbar = document.querySelector("#admin-topbar");
	if (!sidebar || !topbar) throw new Error("后台页面缺少公共布局挂载点。");
	sidebar.innerHTML = `<div class="brand-lockup brand-lockup-side"><span class="brand-mark" aria-hidden="true">C</span><span>CYRENE <small>ADMIN</small></span></div><nav class="side-nav" aria-label="后台导航">${NAVIGATION.map((section, index) => `<section class="nav-section" aria-labelledby="nav-section-${index}"><p id="nav-section-${index}" class="sidebar-label">${section.label}</p>${section.items.map(navigationItem).join("")}</section>`).join("")}</nav><div class="sidebar-bottom"><div class="admin-identity"><span class="admin-avatar">A</span><span><strong>Administrator</strong><small>博客管理员</small></span></div><div class="sidebar-actions"><a id="blog-link" href="#" target="_blank" rel="noreferrer" class="sidebar-action hidden" title="查看博客">${icon("external-link")}<span>查看博客</span></a><button id="logout-button" class="sidebar-action" type="button" title="退出登录">${icon("log-out")}<span>退出</span></button></div></div>`;
	const returnPath = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
	topbar.innerHTML = `<div class="topbar-heading"><span class="topbar-icon" aria-hidden="true">${icon(page.icon)}</span><div><p class="eyebrow">${page.eyebrow}</p><h2>${page.title}</h2></div></div><div class="topbar-actions"><button id="language-toggle" class="language-toggle" type="button">${languageIcon()}<span data-language-code>EN</span></button><a id="repo-settings" class="topbar-meta" href="/setup.html?return=${returnPath}" title="更改 GitHub 仓库">${icon("settings")}<span id="repo-meta">连接 GitHub 中…</span></a></div>`;
	bindLanguageToggle(document.querySelector("#language-toggle"));
	document.querySelector("#logout-button").addEventListener("click", async () => {
		await api("/api/auth/logout", { method: "POST" }).catch(() => {});
		window.location.replace("/");
	});
}

export function updateShellContext({ setup, drafts = [], config, navigationDisabled = false }) {
	const settings = setup?.settings || {};
	const repository = settings.owner && settings.repo ? `${settings.owner}/${settings.repo}` : "等待仓库设置";
	const repoMeta = document.querySelector("#repo-meta");
	if (repoMeta) repoMeta.textContent = settings.branch ? `${repository} · ${settings.branch}` : repository;
	const draftCount = document.querySelector("#draft-count");
	if (draftCount) draftCount.textContent = String(drafts.length);
	const blogLink = document.querySelector("#blog-link");
	const siteUrl = config?.settings?.siteUrl;
	if (blogLink && siteUrl) {
		blogLink.href = siteUrl;
		blogLink.classList.remove("hidden");
	}
	document.querySelectorAll("[data-navigation-link]").forEach((link) => {
		link.classList.toggle("is-disabled", navigationDisabled);
		link.setAttribute("aria-disabled", String(navigationDisabled));
		if (navigationDisabled) link.addEventListener("click", (event) => event.preventDefault());
	});
}

export function revealShell() {
	document.querySelector("#app-shell")?.classList.remove("hidden");
}
