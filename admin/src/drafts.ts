import { HttpError } from "./response";
import type { DraftKind, DraftRecord } from "./types";

const DRAFT_KINDS = new Set<DraftKind>(["article", "dynamic", "settings", "studio"]);

function parseJsonObject(value: string, fallback: Record<string, unknown> = {}): Record<string, unknown> {
	try {
		const parsed = JSON.parse(value) as unknown;
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : fallback;
	} catch {
		return fallback;
	}
}

function mapDraft(row: { id: string; kind: DraftKind; title: string; path: string; payload: string; base_revision: string; created_at: string; updated_at: string }): DraftRecord {
	return {
		id: row.id,
		kind: row.kind,
		title: row.title,
		path: row.path,
		payload: parseJsonObject(row.payload),
		baseRevision: parseJsonObject(row.base_revision) as Record<string, string | null>,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export async function listDrafts(env: Env): Promise<DraftRecord[]> {
	const result = await env.DB.prepare(
		"SELECT id, kind, title, path, payload, base_revision, created_at, updated_at FROM drafts ORDER BY updated_at DESC",
	).all<{ id: string; kind: DraftKind; title: string; path: string; payload: string; base_revision: string; created_at: string; updated_at: string }>();
	return (result.results || []).map(mapDraft);
}

export async function readDrafts(env: Env, ids: string[]): Promise<DraftRecord[]> {
	if (ids.length === 0) return [];
	const placeholders = ids.map(() => "?").join(", ");
	const result = await env.DB.prepare(
		`SELECT id, kind, title, path, payload, base_revision, created_at, updated_at FROM drafts WHERE id IN (${placeholders})`,
	).bind(...ids).all<{ id: string; kind: DraftKind; title: string; path: string; payload: string; base_revision: string; created_at: string; updated_at: string }>();
	return (result.results || []).map(mapDraft);
}

export async function saveDraft(env: Env, input: {
	id?: unknown;
	kind?: unknown;
	title?: unknown;
	path?: unknown;
	payload?: unknown;
	baseRevision?: unknown;
}): Promise<DraftRecord> {
	if (typeof input.kind !== "string" || !DRAFT_KINDS.has(input.kind as DraftKind)) throw new HttpError(400, "DRAFT_INVALID", "草稿类型无效。");
	if (!input.payload || typeof input.payload !== "object" || Array.isArray(input.payload)) throw new HttpError(400, "DRAFT_INVALID", "草稿内容格式无效。");
	if (!input.baseRevision || typeof input.baseRevision !== "object" || Array.isArray(input.baseRevision)) throw new HttpError(400, "DRAFT_INVALID", "草稿基准版本格式无效。");
	const id = typeof input.id === "string" && /^[A-Za-z0-9:_./-]{1,300}$/.test(input.id) ? input.id : crypto.randomUUID();
	const title = typeof input.title === "string" ? input.title.trim().slice(0, 200) : "未命名草稿";
	const path = typeof input.path === "string" ? input.path.trim().slice(0, 500) : "";
	const payload = JSON.stringify(input.payload);
	const baseRevision = JSON.stringify(input.baseRevision);
	if (payload.length > 300_000 || baseRevision.length > 20_000) throw new HttpError(413, "DRAFT_TOO_LARGE", "草稿内容过大，请拆分后保存。");
	await env.DB.prepare(
		`INSERT INTO drafts (id, kind, title, path, payload, base_revision, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
		 ON CONFLICT(id) DO UPDATE SET kind = excluded.kind, title = excluded.title, path = excluded.path,
		 payload = excluded.payload, base_revision = excluded.base_revision, updated_at = CURRENT_TIMESTAMP`,
	).bind(id, input.kind, title, path, payload, baseRevision).run();
	const rows = await readDrafts(env, [id]);
	if (!rows[0]) throw new HttpError(500, "DRAFT_SAVE_FAILED", "草稿保存失败，请稍后重试。");
	return rows[0];
}

export async function deleteDrafts(env: Env, ids: string[]): Promise<void> {
	if (ids.length === 0) return;
	const placeholders = ids.map(() => "?").join(", ");
	await env.DB.prepare(`DELETE FROM drafts WHERE id IN (${placeholders})`).bind(...ids).run();
}
