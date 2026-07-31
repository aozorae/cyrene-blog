import { api } from "../core/api.js";
import { findDraft, saveDraftRecord, submitDraftIds } from "../core/drafts.js";
import { initializeAdminPage, pageQuery } from "../core/page.js";
import { $, setBusy, setStatus, showToast } from "../core/ui.js";
import { articleBaseRevision } from "../features/draft-revisions.js";
import { createMarkdownEditor } from "../features/markdown-editor.js";

let articleSha = null;
let articleRevision = null;
const articleEditor = createMarkdownEditor({
	editorId: "article-content-editor",
	sourceId: "article-content",
	placeholder: "# 从这里开始\n\n记录你的想法、过程和结论。",
});

function slugify(value) {
	return (
		String(value || "")
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
			.replace(/^-+|-+$/g, "") || `post-${Date.now()}`
	);
}

function collectArticle() {
	return {
		title: $("#article-title").value,
		description: $("#article-description").value,
		slug: $("#article-slug").value,
		directory: $("#article-directory").value,
		category: $("#article-category").value,
		tags: $("#article-tags").value.split(","),
		image: $("#article-image").value,
		published: $("#article-published").value,
		originalPath: $("#article-original-path").value,
		content: articleEditor.getValue(),
	};
}

function articleTargetPath(input) {
	const directory = input.directory.trim().replace(/^\/+|\/+$/g, "");
	return `src/content/posts/${directory ? `${directory}/` : ""}${slugify(input.slug || input.title)}.md`;
}

function resetArticleForm() {
	$("#article-form").reset();
	articleEditor.reset();
	$("#article-category").value = "随笔";
	$("#article-published").value = new Date().toISOString().slice(0, 10);
	$("#article-original-path").value = "";
	$("#article-draft-id").value = "";
	$("#article-form-title").textContent = "新文章";
	articleSha = null;
	articleRevision = null;
	setStatus("#article-status", "");
}

function populateArticle(input, revision = null, draftId = "") {
	$("#article-title").value = input.title || "";
	$("#article-description").value = input.description || "";
	$("#article-slug").value = input.slug || "";
	$("#article-directory").value = input.directory || "";
	$("#article-category").value = input.category || "随笔";
	$("#article-tags").value = (input.tags || []).join(", ");
	$("#article-image").value = input.image || "";
	$("#article-published").value = String(input.published || "").slice(0, 10);
	$("#article-original-path").value = input.originalPath || input.path || "";
	articleEditor.setValue(input.content || "");
	$("#article-draft-id").value = draftId;
	$("#article-form-title").textContent = `编辑：${input.title || "未命名文章"}`;
	articleRevision = revision;
}

async function saveArticleDraft() {
	const input = collectArticle();
	const target = articleTargetPath(input);
	const baseRevision = articleBaseRevision(
		articleRevision,
		input.originalPath,
		articleSha,
		target,
	);
	const result = await saveDraftRecord({
		id: $("#article-draft-id").value || undefined,
		kind: "article",
		title: input.title || "新文章",
		path: target,
		payload: { input },
		baseRevision,
	});
	$("#article-draft-id").value = result.draft.id;
	articleRevision = result.draft.baseRevision;
	showToast(result.message);
	return result.draft;
}

async function main() {
	const context = await initializeAdminPage({ id: "article", eyebrow: "CONTENT", title: "发布文章", icon: "file-plus-2" });
	if (!context) return;
	resetArticleForm();
	try {
		await articleEditor.ensure();
		const draft = findDraft(context.drafts, pageQuery().get("draft"), "article");
		const path = pageQuery().get("path");
		if (draft) populateArticle(draft.payload.input, draft.baseRevision, draft.id);
		else if (path) {
			const article = await api(`/api/article?path=${encodeURIComponent(path)}`);
			if (!article.editable) throw new Error("MDX 文章包含组件代码，请从管理内容页面查看源码并前往 GitHub 编辑。");
			articleSha = article.sha;
			populateArticle({ ...article, originalPath: article.path }, { [article.path]: article.sha });
		}
	} catch (error) {
		setStatus("#article-status", error.message, "error");
	}

	$("#article-reset").addEventListener("click", resetArticleForm);
	$("#article-draft-save").addEventListener("click", async (event) => {
		setBusy(event.currentTarget, true);
		setStatus("#article-status", "保存中…");
		try {
			await saveArticleDraft();
			setStatus("#article-status", "草稿已保存。", "success");
		} catch (error) {
			setStatus("#article-status", error.message, "error");
		} finally {
			setBusy(event.currentTarget, false);
		}
	});
	$("#article-form").addEventListener("submit", async (event) => {
		event.preventDefault();
		if (!articleEditor.getValue().trim()) {
			setStatus("#article-status", "请先填写文章正文。", "error");
			articleEditor.focus();
			return;
		}
		setBusy(event.submitter, true);
		setStatus("#article-status", "提交中…");
		try {
			const draft = await saveArticleDraft();
			const result = await submitDraftIds([draft.id]);
			setStatus("#article-status", result.message, "success");
			showToast(result.message);
			window.setTimeout(() => window.location.replace("/articles.html"), 700);
		} catch (error) {
			setStatus("#article-status", error.message, "error");
		} finally {
			setBusy(event.submitter, false);
		}
	});
}

main();
