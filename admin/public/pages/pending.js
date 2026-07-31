import { api } from "../core/api.js";
import { draftEditUrl, submitDraftIds } from "../core/drafts.js";
import { initializeAdminPage } from "../core/page.js";
import { translateText } from "../core/i18n.js";
import { escapeHtml, formatDate, setBusy, showToast } from "../core/ui.js";
import { findStudioGroupByPath } from "../studio-catalog.js";

function editUrl(draft) {
	if (draft.kind !== "studio") return draftEditUrl(draft);
	const group = findStudioGroupByPath(draft.payload.path).id;
	return `/studio.html?group=${encodeURIComponent(group)}&draft=${encodeURIComponent(draft.id)}`;
}

function renderDrafts(drafts) {
	const container = document.querySelector("#pending-list");
	if (!drafts.length) {
		container.innerHTML = '<p class="empty-copy">没有待提交草稿。</p>';
		return;
	}
	container.innerHTML = drafts
			.map((draft) => `<div class="content-row pending-row"><input class="pending-checkbox" type="checkbox" value="${escapeHtml(draft.id)}" /><div class="content-row-main"><strong data-i18n-ignore>${escapeHtml(draft.title)}</strong><small>${escapeHtml(draft.kind)} · <span data-i18n-ignore>${escapeHtml(draft.path || translateText("新内容"))}</span> · ${formatDate(draft.updatedAt)}</small></div><div class="row-actions"><a class="button button-quiet compact-button" href="${editUrl(draft)}">编辑</a><button class="button button-danger compact-button" data-delete-draft="${escapeHtml(draft.id)}">删除草稿</button></div></div>`)
		.join("");
	container.querySelectorAll("[data-delete-draft]").forEach((button) =>
		button.addEventListener("click", async () => {
			if (!window.confirm("确定删除这个草稿吗？")) return;
			setBusy(button, true);
			try {
				await api(`/api/drafts?id=${encodeURIComponent(button.dataset.deleteDraft)}`, { method: "DELETE" });
				window.location.reload();
			} catch (error) {
				showToast(error.message, "error");
				setBusy(button, false);
			}
		}),
	);
}

async function main() {
	const context = await initializeAdminPage({ id: "pending", eyebrow: "DRAFTS", title: "待提交", icon: "list-checks" });
	if (!context) return;
	renderDrafts(context.drafts);
	document.querySelector("#pending-select-all").addEventListener("change", (event) => {
		document.querySelectorAll(".pending-checkbox").forEach((input) => {
			input.checked = event.target.checked;
		});
	});
	document.querySelector("#pending-submit").addEventListener("click", async (event) => {
		const ids = [...document.querySelectorAll(".pending-checkbox:checked")].map((input) => input.value);
		if (!ids.length) {
			showToast("请先选择待提交草稿。", "error");
			return;
		}
		setBusy(event.currentTarget, true);
		try {
			const result = await submitDraftIds(ids);
			showToast(result.message);
			window.location.reload();
		} catch (error) {
			showToast(error.message, "error");
			setBusy(event.currentTarget, false);
		}
	});
}

main();
