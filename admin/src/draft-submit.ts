import { writeAudit } from "./audit";
import { buildStudioChange } from "./config-studio";
import { buildSettingsChanges } from "./config-service";
import { articleChanges, buildDynamic } from "./content-service";
import { deleteDrafts, readDrafts } from "./drafts";
import { commitChanges, getBranchHead, readOptionalFile, type GitChange } from "./github";
import { HttpError } from "./response";
import type { DraftRecord, RepositoryContext } from "./types";

interface ConflictDetail {
	draftId: string;
	path: string;
	expectedSha: string | null;
	actualSha: string | null;
}

async function findConflicts(context: RepositoryContext, drafts: DraftRecord[]): Promise<ConflictDetail[]> {
	const checks = drafts.flatMap((draft) => Object.entries(draft.baseRevision).map(([path, expectedSha]) => ({ draftId: draft.id, path, expectedSha })));
	const results = await Promise.all(checks.map(async (check) => {
		const current = await readOptionalFile(context, check.path);
		const actualSha = current?.sha || null;
		return actualSha === check.expectedSha ? null : { ...check, actualSha };
	}));
	return results.filter((item): item is ConflictDetail => item !== null);
}

function objectPayload(draft: DraftRecord): Record<string, unknown> {
	if (!draft.payload || typeof draft.payload !== "object" || Array.isArray(draft.payload)) throw new HttpError(400, "DRAFT_INVALID", `草稿 ${draft.title} 的内容格式无效。`);
	return draft.payload;
}

async function materializeDraft(context: RepositoryContext, draft: DraftRecord): Promise<GitChange[]> {
	const payload = objectPayload(draft);
	if (draft.kind === "article") return articleChanges(payload.input).changes;
	if (draft.kind === "dynamic") {
		const dynamic = buildDynamic(payload.input as never);
		return [{ path: dynamic.path, content: dynamic.content }];
	}
	if (draft.kind === "settings") return buildSettingsChanges(context, payload.settings);
	if (draft.kind === "studio") {
		if (typeof payload.path !== "string" || !payload.values || typeof payload.values !== "object" || Array.isArray(payload.values)) throw new HttpError(400, "DRAFT_INVALID", "配置草稿格式无效。");
		return [(await buildStudioChange(context, payload.path, payload.values as Record<string, unknown>)).change];
	}
	throw new HttpError(400, "DRAFT_INVALID", "草稿类型无效。");
}

export async function submitDrafts(env: Env, context: RepositoryContext, ids: string[], force: boolean): Promise<{ commit: { sha: string; url: string }; message: string }> {
	const uniqueIds = [...new Set(ids)].filter((id) => typeof id === "string" && id.length <= 300);
	if (uniqueIds.length === 0 || uniqueIds.length > 30) throw new HttpError(400, "DRAFT_SELECTION_INVALID", "请选择 1 到 30 个待提交草稿。");
	const drafts = await readDrafts(env, uniqueIds);
	if (drafts.length !== uniqueIds.length) throw new HttpError(404, "DRAFT_NOT_FOUND", "部分草稿不存在，请刷新待提交列表。");
	const conflicts = await findConflicts(context, drafts);
	if (conflicts.length > 0 && !force) {
		throw new HttpError(409, "DRAFT_CONFLICT", "GitHub 中的文件已发生变化。你可以刷新内容，或确认后强制覆盖。", { conflicts });
	}
	const groups = await Promise.all(drafts.map((draft) => materializeDraft(context, draft)));
	const changes = groups.flat();
	const paths = new Set<string>();
	for (const change of changes) {
		if (paths.has(change.path)) throw new HttpError(409, "DRAFT_PATH_CONFLICT", `多个草稿同时修改了 ${change.path}，请分开提交。`);
		paths.add(change.path);
	}
	const head = await getBranchHead(context);
	const commit = await commitChanges(context, changes, drafts.length === 1 ? `Update ${drafts[0].title} from Firefly Admin` : `Publish ${drafts.length} staged changes from Firefly Admin`, head);
	await deleteDrafts(env, uniqueIds);
	await writeAudit(env, force ? "draft.force_publish" : "draft.publish", `${force ? "强制覆盖并" : ""}提交 ${drafts.length} 个暂存更改`, commit.sha);
	return { commit, message: "已经提交，自动部署。" };
}
