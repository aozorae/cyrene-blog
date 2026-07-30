import { HttpError } from "./response";
import type { RepositorySettings } from "./types";

function validateSegment(value: unknown, label: string): string {
	if (typeof value !== "string") throw new HttpError(400, "SETUP_INVALID", `${label}格式无效。`);
	const normalized = value.trim();
	if (!normalized || normalized.length > 100 || !/^[A-Za-z0-9_.-]+$/.test(normalized)) {
		throw new HttpError(400, "SETUP_INVALID", `${label}只能包含字母、数字、点、短横线和下划线。`);
	}
	return normalized;
}

export function validateRepositorySettings(input: unknown): RepositorySettings {
	if (!input || typeof input !== "object" || Array.isArray(input)) throw new HttpError(400, "SETUP_INVALID", "仓库设置格式无效。");
	const value = input as Record<string, unknown>;
	const branch = typeof value.branch === "string" ? value.branch.trim() : "";
	if (!branch || branch.length > 200 || branch.startsWith("/") || branch.endsWith("/") || branch.includes("..") || /[\u0000-\u0020~^:?*\[\\]/.test(branch)) {
		throw new HttpError(400, "SETUP_INVALID", "分支名称格式无效。");
	}
	return {
		owner: validateSegment(value.owner, "仓库所有者"),
		repo: validateSegment(value.repo, "仓库名称"),
		branch,
	};
}

export async function readRepositorySettings(env: Env): Promise<RepositorySettings | null> {
	const row = await env.DB.prepare("SELECT github_owner, github_repo, github_branch FROM admin_settings WHERE id = 1")
		.first<{ github_owner: string; github_repo: string; github_branch: string }>();
	return row ? { owner: row.github_owner, repo: row.github_repo, branch: row.github_branch } : null;
}

export async function requireRepositorySettings(env: Env): Promise<RepositorySettings> {
	const settings = await readRepositorySettings(env);
	if (!settings) throw new HttpError(409, "SETUP_REQUIRED", "请先完成 GitHub 仓库设置。");
	return settings;
}

export async function saveRepositorySettings(env: Env, settings: RepositorySettings): Promise<void> {
	await env.DB.prepare(
		`INSERT INTO admin_settings (id, github_owner, github_repo, github_branch, updated_at)
		 VALUES (1, ?, ?, ?, CURRENT_TIMESTAMP)
		 ON CONFLICT(id) DO UPDATE SET github_owner = excluded.github_owner, github_repo = excluded.github_repo,
		 github_branch = excluded.github_branch, updated_at = CURRENT_TIMESTAMP`,
	).bind(settings.owner, settings.repo, settings.branch).run();
}
