import { escapeHtml } from "../core/ui.js";

export function renderContentList(container, items, options = {}) {
	if (!items?.length) {
		container.innerHTML = '<p class="empty-copy">还没有内容。</p>';
		return;
	}
	container.innerHTML = items
		.map((item) => {
			const edit = options.onEdit
				? `<button class="button button-quiet compact-button" data-edit-path="${escapeHtml(item.path)}">${item.editable === false ? "查看源码" : "编辑"}</button>`
				: "";
			return `<div class="content-row"><div class="content-row-main"><strong>${escapeHtml(item.title || item.path)}</strong><small>${escapeHtml(item.published || item.path)}${item.description ? ` · ${escapeHtml(item.description)}` : ""}</small><p>${escapeHtml(item.content || "")}</p></div><div class="row-actions">${edit}<button class="button button-danger compact-button" data-delete-path="${escapeHtml(item.path)}">删除</button></div></div>`;
		})
		.join("");
	container.querySelectorAll("[data-edit-path]").forEach((button) =>
		button.addEventListener("click", () => options.onEdit(button.dataset.editPath)),
	);
	container.querySelectorAll("[data-delete-path]").forEach((button) =>
		button.addEventListener("click", () => options.onDelete?.(button.dataset.deletePath, button)),
	);
}
