import { api } from "./api.js";

export async function saveDraftRecord(record) {
	const result = await api("/api/drafts", {
		method: "PUT",
		body: JSON.stringify(record),
	});
	return result;
}

export async function submitDraftIds(ids, force = false) {
	try {
		return await api("/api/drafts/submit", {
			method: "POST",
			body: JSON.stringify({ ids, force }),
		});
	} catch (error) {
		if (
			error.code === "DRAFT_CONFLICT" &&
			!force &&
			window.confirm(`${error.message}\n\n是否强制覆盖 GitHub 中的最新内容？`)
		)
			return submitDraftIds(ids, true);
		throw error;
	}
}

export function findDraft(drafts, id, kind) {
	if (!id) return null;
	return drafts.find((draft) => draft.id === id && (!kind || draft.kind === kind)) || null;
}

export function draftEditUrl(draft) {
	const id = encodeURIComponent(draft.id);
	if (draft.kind === "settings") return `/settings.html?draft=${id}`;
	if (draft.kind === "studio") return `/studio.html?draft=${id}`;
	if (draft.kind === "article") return `/article.html?draft=${id}`;
	if (draft.kind === "dynamic") return `/dynamic.html?draft=${id}`;
	return "/pending.html";
}
