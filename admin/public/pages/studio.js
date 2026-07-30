import { api } from "../core/api.js";
import { findDraft, saveDraftRecord, submitDraftIds } from "../core/drafts.js";
import { initializeAdminPage, pageQuery } from "../core/page.js";
import { $, escapeHtml, setBusy, setStatus, showToast } from "../core/ui.js";
import { fieldInfo } from "../field-guide.js";
import { mountShell, updateShellContext } from "../layout/shell.js";
import { findStudioGroup, findStudioGroupByPath } from "../studio-catalog.js";
import { collectStudioFormValues, renderStudioForm } from "../studio-form.js";

let studio = [];
let studioIndex = 0;
let studioGroup = findStudioGroup(pageQuery().get("group") || "foundation").id;
let revisionOverride = null;

function documentsForGroup() {
	return findStudioGroup(studioGroup).items
		.map((item) => {
			const index = studio.findIndex((document) => document.path === item.path);
			return index < 0 ? null : { ...item, index, document: studio[index] };
		})
		.filter(Boolean);
}

function currentNavigationItem() {
	return documentsForGroup().find((item) => item.index === studioIndex) || null;
}

function renderStudio() {
	const group = findStudioGroup(studioGroup);
	const documents = documentsForGroup();
	if (!documents.some((item) => item.index === studioIndex) && documents[0]) {
		studioIndex = documents[0].index;
	}
	$("#studio-section-kicker").textContent = group.label;
	$("#studio-section-description").textContent = group.description;
	$("#studio-config-tabs").innerHTML = documents
		.map((item) => `<button class="studio-tab ${item.index === studioIndex ? "active" : ""}" type="button" role="tab" aria-selected="${item.index === studioIndex}" data-studio-index="${item.index}">${escapeHtml(item.label)}</button>`)
		.join("");
	const document = studio[studioIndex];
	if (!document) {
		$("#studio-editor").innerHTML = '<p class="empty-copy">正在读取配置模块…</p>';
		return;
	}
	renderStudioForm($("#studio-editor"), {
		doc: document,
		navigationTitle: currentNavigationItem()?.label || document.title,
		fieldInfo,
		escapeHtml,
	});
}

async function saveStudioDraft() {
	const document = studio[studioIndex];
	const result = await saveDraftRecord({
		id: `studio:${document.path}`,
		kind: "studio",
		title: document.title,
		path: document.path,
		payload: { path: document.path, values: collectStudioFormValues() },
		baseRevision: revisionOverride || { [document.path]: document.sha || null },
	});
	revisionOverride = result.draft.baseRevision;
	showToast(result.message);
	return result.draft;
}

async function main() {
	const context = await initializeAdminPage({
		id: "studio",
		group: studioGroup,
		eyebrow: findStudioGroup(studioGroup).eyebrow,
		title: findStudioGroup(studioGroup).label,
		icon: findStudioGroup(studioGroup).icon,
	});
	if (!context) return;
	try {
		studio = await api("/api/studio");
		const draft = findDraft(context.drafts, pageQuery().get("draft"), "studio");
		if (draft) {
			const index = studio.findIndex((document) => document.path === draft.payload.path);
			if (index >= 0) {
				studioIndex = index;
				studioGroup = findStudioGroupByPath(draft.payload.path).id;
				studio[index] = { ...studio[index], exports: structuredClone(draft.payload.values) };
				revisionOverride = draft.baseRevision;
				const group = findStudioGroup(studioGroup);
				mountShell({ id: "studio", group: studioGroup, eyebrow: group.eyebrow, title: group.label, icon: group.icon });
				updateShellContext(context);
			}
		}
		renderStudio();
	} catch (error) {
		showToast(error.message, "error");
		return;
	}

	$("#studio-config-tabs").addEventListener("click", (event) => {
		const button = event.target.closest("[data-studio-index]");
		if (!button) return;
		studioIndex = Number(button.dataset.studioIndex);
		revisionOverride = null;
		renderStudio();
	});
	$("#studio-draft-save").addEventListener("click", async (event) => {
		setBusy(event.currentTarget, true);
		setStatus("#studio-status", "保存中…");
		try {
			await saveStudioDraft();
			setStatus("#studio-status", "草稿已保存。", "success");
		} catch (error) {
			setStatus("#studio-status", error.message, "error");
		} finally {
			setBusy(event.currentTarget, false);
		}
	});
	$("#studio-submit").addEventListener("click", async (event) => {
		setBusy(event.currentTarget, true);
		setStatus("#studio-status", "提交中…");
		try {
			const draft = await saveStudioDraft();
			const result = await submitDraftIds([draft.id]);
			setStatus("#studio-status", result.message, "success");
			showToast(result.message);
		} catch (error) {
			setStatus("#studio-status", error.message, "error");
		} finally {
			setBusy(event.currentTarget, false);
		}
	});
}

main();
