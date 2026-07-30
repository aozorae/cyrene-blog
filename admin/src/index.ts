import { fail, HttpError } from "./response";
import { routeApi } from "./router";

function errorResponse(error: unknown): Response {
	if (error instanceof HttpError) return fail(error.code, error.message, error.status, error.details);
	console.error(JSON.stringify({ source: "firefly-admin", error: error instanceof Error ? error.name : "unknown" }));
	return fail("INTERNAL_ERROR", "后台暂时无法完成操作，请稍后重试。", 500);
}

function withSecurityHeaders(response: Response): Response {
	const secured = new Response(response.body, response);
	secured.headers.set("X-Content-Type-Options", "nosniff");
	secured.headers.set("Referrer-Policy", "same-origin");
	secured.headers.set("X-Frame-Options", "DENY");
	secured.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
	secured.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
	return secured;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		try {
			const path = new URL(request.url).pathname;
			const response = path.startsWith("/api/") ? await routeApi(request, env) : await env.ASSETS.fetch(request);
			return withSecurityHeaders(response);
		} catch (error) {
			return withSecurityHeaders(errorResponse(error));
		}
	},
};
