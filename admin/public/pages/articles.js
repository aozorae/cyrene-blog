import { api } from "../core/api.js";
import { initializeAdminPage } from "../core/page.js";
import { $, setBusy, showToast } from "../core/ui.js";
import { renderContentList } from "../features/content-list.js";

const CONTENT_MODES = {
	articles: {
		description: "查看、编辑或删除已发布文章。",
		endpoint: "/api/articles",
		title: "管理文章",
	},
	dynamics: {
		description: "查看或删除已发布动态。",
		endpoint: "/api/dynamics",
		title: "管理动态",
	},
};

let activeMode = "articles";
let loadSequence = 0;

async function openArticle(path) {
	try {
		const article = await api(`/api/article?path=${encodeURIComponent(path)}`);
		if (article.editable) {
			window.location.href = `/article.html?path=${encodeURIComponent(article.path)}`;
			return;
		}
		$("#source-title").textContent = article.path;
		$("#source-content").textContent = article.source || article.content;
		$("#source-dialog").showModal();
	} catch (error) {
		showToast(error.message, "error");
	}
}

async function deleteContent(mode, path, button) {
	const label = mode === "dynamics" ? "这条动态" : "这篇文章";
	if (!window.confirm(`确定删除${label}吗？删除会立即创建 GitHub 提交。`)) return;
	setBusy(button, true);
	try {
		const result = await api(`${CONTENT_MODES[mode].endpoint}?path=${encodeURIComponent(path)}`, {
			method: "DELETE",
		});
		showToast(result.message);
		if (activeMode === mode) await loadContent(mode);
	} catch (error) {
		showToast(error.message, "error");
	} finally {
		setBusy(button, false);
	}
}

async function loadContent(mode) {
	const sequence = ++loadSequence;
	const items = await api(CONTENT_MODES[mode].endpoint);
	if (sequence !== loadSequence || activeMode !== mode) return;
	renderContentList($("#content-list"), items, {
		onEdit: mode === "articles" ? openArticle : undefined,
		onDelete: async (path, button) => {
			await deleteContent(mode, path, button);
		},
	});
}

async function selectContentMode(mode, focus = false) {
	if (!CONTENT_MODES[mode]) return;
	activeMode = mode;
	const switcher = $("#content-mode-switch");
	switcher.dataset.mode = mode;
	switcher.querySelectorAll("[data-content-mode]").forEach((button) => {
		const selected = button.dataset.contentMode === mode;
		button.classList.toggle("is-active", selected);
		button.setAttribute("aria-selected", String(selected));
		button.tabIndex = selected ? 0 : -1;
		if (selected && focus) button.focus();
	});
	$("#content-list-title").textContent = CONTENT_MODES[mode].title;
	$("#content-list-description").textContent = CONTENT_MODES[mode].description;
	$("#content-list").setAttribute("aria-labelledby", `content-mode-${mode}`);
	$("#content-list").innerHTML = '<p class="empty-copy">加载中…</p>';
	try {
		await loadContent(mode);
	} catch (error) {
		if (activeMode !== mode) return;
		$("#content-list").innerHTML = '<p class="empty-copy">内容加载失败。</p>';
		showToast(error.message, "error");
	}
}

async function main() {
	const context = await initializeAdminPage({ id: "articles", eyebrow: "CONTENT", title: "管理内容", icon: "file-text" });
	if (!context) return;
	$("#source-close").addEventListener("click", () => $("#source-dialog").close());
	$("#content-mode-switch").addEventListener("click", (event) => {
		const button = event.target.closest("[data-content-mode]");
		if (button) selectContentMode(button.dataset.contentMode);
	});
	$("#content-mode-switch").addEventListener("keydown", (event) => {
		if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
		event.preventDefault();
		selectContentMode(activeMode === "articles" ? "dynamics" : "articles", true);
	});
	await selectContentMode("articles");
}

main();
