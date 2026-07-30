import { assertSameOrigin, clearSessionCookie, createSession, hasValidSession, sessionCookie, verifyPassword } from "./auth";
import { writeAudit } from "./audit";
import { assertLoginAllowed, clearLoginFailures, recordLoginFailure } from "./login-rate-limit";
import { requireSecret } from "./middleware";
import { fail, ok, readJson } from "./response";

export async function handlePublicAuthRoute(request: Request, env: Env, path: string): Promise<Response | null> {
	if (path === "/api/auth/me" && request.method === "GET") {
		const sessionSecret = requireSecret(env.SESSION_SECRET, "SESSION_SECRET");
		return ok({ authenticated: await hasValidSession(request, sessionSecret) });
	}
	if (path === "/api/auth/login" && request.method === "POST") {
		assertSameOrigin(request);
		const sessionSecret = requireSecret(env.SESSION_SECRET, "SESSION_SECRET");
		const key = await assertLoginAllowed(request, env);
		const payload = await readJson<{ password?: unknown }>(request, 10_000);
		const password = requireSecret(env.ADMIN_PASSWORD, "ADMIN_PASSWORD");
		if (typeof payload.password !== "string" || !(await verifyPassword(payload.password, password))) {
			await Promise.all([recordLoginFailure(env, key), writeAudit(env, "auth.login", "管理员登录失败", null, "failed")]);
			return fail("INVALID_CREDENTIALS", "密码不正确，请检查后重试。", 401);
		}
		await Promise.all([clearLoginFailures(env, key), writeAudit(env, "auth.login", "管理员登录成功", null)]);
		return new Response(JSON.stringify({ ok: true, data: { authenticated: true } }), {
			status: 200,
			headers: { "Content-Type": "application/json; charset=utf-8", "Set-Cookie": sessionCookie(await createSession(sessionSecret)) },
		});
	}
	if (path === "/api/auth/logout" && request.method === "POST") {
		assertSameOrigin(request);
		return new Response(JSON.stringify({ ok: true, data: null }), {
			status: 200,
			headers: { "Content-Type": "application/json; charset=utf-8", "Set-Cookie": clearSessionCookie() },
		});
	}
	return null;
}
