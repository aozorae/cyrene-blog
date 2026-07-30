import { api } from "../core/api.js";
import { findDraft, saveDraftRecord, submitDraftIds } from "../core/drafts.js";
import { initializeAdminPage, pageQuery } from "../core/page.js";
import { $, setBusy, setStatus, showToast } from "../core/ui.js";
import { renderContentList } from "../features/content-list.js";
import { targetBaseRevision } from "../features/draft-revisions.js";

let dynamicRevision = null;

function dynamicInput() {
	let local = $("#dynamic-published").value;
	if (!local) {
		local = new Date().toISOString().slice(0, 16);
		$("#dynamic-published").value = local;
	}
	return {
		content: $("#dynamic-content").value,
		published: `${local.replace("T", " ")}:00`,
	};
}

function dynamicTargetPath(input) {
	const date = input.published || new Date().toISOString().slice(0, 19).replace("T", " ");
	const digits = date.replace(/\D/g, "").padEnd(14, "0").slice(0, 14);
	return `src/content/dynamic/${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 14)}.md`;
}

async function saveDynamicDraft() {
	const input = dynamicInput();
	const target = dynamicTargetPath(input);
	const result = await saveDraftRecord({
		id: $("#dynamic-draft-id").value || undefined,
		kind: "dynamic",
		title: `动态 ${input.published || "未定时间"}`,
		path: target,
		payload: { input },
		baseRevision: targetBaseRevision(dynamicRevision, target),
	});
	$("#dynamic-draft-id").value = result.draft.id;
	dynamicRevision = result.draft.baseRevision;
	showToast(result.message);
	return result.draft;
}

async function loadDynamics() {
	const dynamics = await api("/api/dynamics");
	renderContentList($("#dynamic-list"), dynamics, {
		onDelete: async (path, button) => {
			if (!window.confirm("确定删除这条动态吗？删除会立即创建 GitHub 提交。")) return;
			setBusy(button, true);
			try {
				const result = await api(`/api/dynamics?path=${encodeURIComponent(path)}`, { method: "DELETE" });
				showToast(result.message);
				await loadDynamics();
			} catch (error) {
				showToast(error.message, "error");
			} finally {
				setBusy(button, false);
			}
		},
	});
}

async function main() {
	const context = await initializeAdminPage({ id: "dynamic", eyebrow: "CONTENT", title: "发布动态", icon: "message-square-plus" });
	if (!context) return;
	const draft = findDraft(context.drafts, pageQuery().get("draft"), "dynamic");
	if (draft) {
		$("#dynamic-content").value = draft.payload.input.content || "";
		$("#dynamic-published").value = String(draft.payload.input.published || "").replace(" ", "T").slice(0, 16);
		$("#dynamic-draft-id").value = draft.id;
		dynamicRevision = draft.baseRevision;
	}
	try {
		await loadDynamics();
	} catch (error) {
		showToast(error.message, "error");
	}

	$("#dynamic-draft-save").addEventListener("click", async (event) => {
		setBusy(event.currentTarget, true);
		setStatus("#dynamic-status", "保存中…");
		try {
			await saveDynamicDraft();
			setStatus("#dynamic-status", "草稿已保存。", "success");
		} catch (error) {
			setStatus("#dynamic-status", error.message, "error");
		} finally {
			setBusy(event.currentTarget, false);
		}
	});
	$("#dynamic-form").addEventListener("submit", async (event) => {
		event.preventDefault();
		setBusy(event.submitter, true);
		setStatus("#dynamic-status", "提交中…");
		try {
			const draftRecord = await saveDynamicDraft();
			const result = await submitDraftIds([draftRecord.id]);
			setStatus("#dynamic-status", result.message, "success");
			showToast(result.message);
			window.setTimeout(() => window.location.replace("/dynamic.html"), 700);
		} catch (error) {
			setStatus("#dynamic-status", error.message, "error");
		} finally {
			setBusy(event.submitter, false);
		}
	});
}

main();
