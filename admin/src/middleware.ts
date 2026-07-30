import { hasValidSession } from "./auth";
import { requireRepositorySettings } from "./admin-settings";
import { createRepositoryContext } from "./github";
import { HttpError } from "./response";
import type { RepositoryContext } from "./types";

export function requireSecret(secret: string | undefined, name: string): string {
	if (!secret) throw new HttpError(503, "SECRET_NOT_CONFIGURED", `${name} 尚未配置，请先注入 Worker Secret。`);
	return secret;
}

export async function requireAuth(request: Request, env: Env): Promise<void> {
	const sessionSecret = requireSecret(env.SESSION_SECRET, "SESSION_SECRET");
	if (!(await hasValidSession(request, sessionSecret))) throw new HttpError(401, "UNAUTHORIZED", "登录状态已失效，请重新登录。");
}

export async function requireRepositoryContext(env: Env): Promise<RepositoryContext> {
	const settings = await requireRepositorySettings(env);
	return createRepositoryContext(env, settings);
}
