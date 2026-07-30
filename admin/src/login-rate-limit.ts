import { HttpError } from "./response";

const WINDOW_SECONDS = 15 * 60;
const MAX_ATTEMPTS = 5;

async function clientKey(request: Request, secret: string): Promise<string> {
	const source = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
	const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${secret}:${source}`));
	return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function assertLoginAllowed(request: Request, env: Env): Promise<string> {
	const key = await clientKey(request, env.SESSION_SECRET);
	await env.DB.prepare("DELETE FROM login_attempts WHERE updated_at < datetime('now', '-7 days')").run();
	const row = await env.DB.prepare("SELECT attempts, window_started, locked_until FROM login_attempts WHERE client_key = ?")
		.bind(key).first<{ attempts: number; window_started: number; locked_until: number }>();
	const now = Math.floor(Date.now() / 1000);
	if (row?.locked_until && row.locked_until > now) {
		throw new HttpError(429, "LOGIN_RATE_LIMITED", "登录尝试过多，请稍后再试。");
	}
	return key;
}

export async function recordLoginFailure(env: Env, key: string): Promise<void> {
	const now = Math.floor(Date.now() / 1000);
	const row = await env.DB.prepare("SELECT attempts, window_started FROM login_attempts WHERE client_key = ?")
		.bind(key).first<{ attempts: number; window_started: number }>();
	const activeWindow = row && now - row.window_started < WINDOW_SECONDS;
	const attempts = activeWindow ? row.attempts + 1 : 1;
	const windowStarted = activeWindow ? row.window_started : now;
	const lockedUntil = attempts >= MAX_ATTEMPTS ? now + WINDOW_SECONDS : 0;
	await env.DB.prepare(
		`INSERT INTO login_attempts (client_key, attempts, window_started, locked_until, updated_at)
		 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
		 ON CONFLICT(client_key) DO UPDATE SET attempts = excluded.attempts, window_started = excluded.window_started,
		 locked_until = excluded.locked_until, updated_at = CURRENT_TIMESTAMP`,
	).bind(key, attempts, windowStarted, lockedUntil).run();
}

export async function clearLoginFailures(env: Env, key: string): Promise<void> {
	await env.DB.prepare("DELETE FROM login_attempts WHERE client_key = ?").bind(key).run();
}
