import { api } from "../core/api.js";
import { initializeAdminPage } from "../core/page.js";
import { $, setBusy, showToast } from "../core/ui.js";
import { renderContentList } from "../features/content-list.js";

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

async function loadArticles() {
	const articles = await api("/api/articles");
	renderContentList($("#article-list"), articles, {
		onEdit: openArticle,
		onDelete: async (path, button) => {
			if (!window.confirm("确定删除这篇文章吗？删除会立即创建 GitHub 提交。")) return;
			setBusy(button, true);
			try {
				const result = await api(`/api/articles?path=${encodeURIComponent(path)}`, { method: "DELETE" });
				showToast(result.message);
				await loadArticles();
			} catch (error) {
				showToast(error.message, "error");
			} finally {
				setBusy(button, false);
			}
		},
	});
}

async function main() {
	const context = await initializeAdminPage({ id: "articles", eyebrow: "CONTENT", title: "已发布文章", icon: "file-text" });
	if (!context) return;
	$("#source-close").addEventListener("click", () => $("#source-dialog").close());
	try {
		await loadArticles();
	} catch (error) {
		showToast(error.message, "error");
	}
}

main();
