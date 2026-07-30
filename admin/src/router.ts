import { assertSameOrigin } from "./auth";
import { requireAuth, requireRepositoryContext } from "./middleware";
import { HttpError } from "./response";
import { handlePublicAuthRoute } from "./routes-auth";
import { handleConfigRoute } from "./routes-config";
import { handleContentRoute } from "./routes-content";
import { handleDashboardRoute } from "./routes-dashboard";
import { handleDraftRoute } from "./routes-drafts";
import { handleSetupRoute } from "./routes-setup";

export async function routeApi(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const path = url.pathname;
	const publicAuth = await handlePublicAuthRoute(request, env, path);
	if (publicAuth) return publicAuth;
	await requireAuth(request, env);
	if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) assertSameOrigin(request);
	const setup = await handleSetupRoute(request, env, path);
	if (setup) return setup;
	const context = await requireRepositoryContext(env);
	const handlers = [
		() => handleDashboardRoute(request, env, context, path),
		() => handleConfigRoute(request, context, path),
		() => handleContentRoute(request, env, context, path, url),
		() => handleDraftRoute(request, env, context, path, url),
	];
	for (const handler of handlers) {
		const response = await handler();
		if (response) return response;
	}
	throw new HttpError(404, "NOT_FOUND", "请求的后台接口不存在。");
}
