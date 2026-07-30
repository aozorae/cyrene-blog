export interface AuditRecord {
	id: number;
	action: string;
	detail: string;
	commitSha: string | null;
	status: string;
	createdAt: string;
}

export async function writeAudit(env: Env, action: string, detail: string, commitSha: string | null, status = "success"): Promise<void> {
	if (!env.DB) return;
	await env.DB.batch([
		env.DB.prepare("INSERT INTO audit_logs (action, detail, commit_sha, status) VALUES (?, ?, ?, ?)").bind(action, detail.slice(0, 500), commitSha, status),
		env.DB.prepare("DELETE FROM audit_logs WHERE created_at < datetime('now', '-90 days')"),
	]);
}

export async function readAudit(env: Env): Promise<AuditRecord[]> {
	if (!env.DB) return [];
	const result = await env.DB.prepare(
		"SELECT id, action, detail, commit_sha, status, created_at FROM audit_logs ORDER BY id DESC LIMIT 50",
	).all<{ id: number; action: string; detail: string; commit_sha: string | null; status: string; created_at: string }>();
	return (result.results || []).map((item) => ({
		id: item.id,
		action: item.action,
		detail: item.detail,
		commitSha: item.commit_sha,
		status: item.status,
		createdAt: item.created_at,
	}));
}
