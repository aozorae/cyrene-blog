import { deleteDrafts, listDrafts, saveDraft } from "./drafts";
import { submitDrafts } from "./draft-submit";
import { HttpError, ok, readJson } from "./response";
import type { RepositoryContext } from "./types";

export async function handleDraftRoute(request: Request, env: Env, context: RepositoryContext, path: string, url: URL): Promise<Response | null> {
	if (path === "/api/drafts" && request.method === "GET") return ok(await listDrafts(env));
	if (path === "/api/drafts" && request.method === "PUT") {
		const draft = await saveDraft(env, await readJson(request, 350_000));
		return ok({ draft, message: "草稿已保存。" });
	}
	if (path === "/api/drafts" && request.method === "DELETE") {
		const id = url.searchParams.get("id") || "";
		if (!id || id.length > 300) throw new HttpError(400, "DRAFT_INVALID", "草稿编号无效。");
		await deleteDrafts(env, [id]);
		return ok({ message: "草稿已删除。" });
	}
	if (path === "/api/drafts/submit" && request.method === "POST") {
		const payload = await readJson<{ ids?: unknown; force?: unknown }>(request, 50_000);
		if (!Array.isArray(payload.ids) || !payload.ids.every((id) => typeof id === "string")) throw new HttpError(400, "DRAFT_SELECTION_INVALID", "待提交草稿格式无效。");
		return ok(await submitDrafts(env, context, payload.ids, payload.force === true));
	}
	return null;
}
