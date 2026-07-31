import { findDraft, saveDraftRecord, submitDraftIds } from "../core/drafts.js";
import { initializeAdminPage, pageQuery } from "../core/page.js";
import { $, setBusy, setStatus, showToast } from "../core/ui.js";
import { targetBaseRevision } from "../features/draft-revisions.js";
import { createMarkdownEditor } from "../features/markdown-editor.js";

let dynamicRevision = null;
const dynamicEditor = createMarkdownEditor({
	editorId: "dynamic-content-editor",
	sourceId: "dynamic-content",
	placeholder: "记录此刻的想法、链接或图片。",
});

function dynamicInput() {
	let local = $("#dynamic-published").value;
	if (!local) {
		local = new Date().toISOString().slice(0, 16);
		$("#dynamic-published").value = local;
	}
	return {
		content: dynamicEditor.getValue(),
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

async function main() {
	const context = await initializeAdminPage({ id: "dynamic", eyebrow: "CONTENT", title: "发布动态", icon: "message-square-plus" });
	if (!context) return;
	const draft = findDraft(context.drafts, pageQuery().get("draft"), "dynamic");
	if (draft) {
		dynamicEditor.setValue(draft.payload.input.content || "");
		$("#dynamic-published").value = String(draft.payload.input.published || "").replace(" ", "T").slice(0, 16);
		$("#dynamic-draft-id").value = draft.id;
		dynamicRevision = draft.baseRevision;
	}
	try {
		await dynamicEditor.ensure();
	} catch (error) {
		setStatus("#dynamic-status", error.message, "error");
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
		if (!dynamicEditor.getValue().trim()) {
			setStatus("#dynamic-status", "请先填写动态内容。", "error");
			dynamicEditor.focus();
			return;
		}
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
