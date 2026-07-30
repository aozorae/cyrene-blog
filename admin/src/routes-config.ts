import { readStudio } from "./config-studio";
import { loadSiteSettings } from "./config-service";
import { ok } from "./response";
import type { RepositoryContext } from "./types";

export async function handleConfigRoute(request: Request, context: RepositoryContext, path: string): Promise<Response | null> {
	if (path === "/api/config" && request.method === "GET") return ok(await loadSiteSettings(context));
	if (path === "/api/studio" && request.method === "GET") return ok(await readStudio(context));
	return null;
}
