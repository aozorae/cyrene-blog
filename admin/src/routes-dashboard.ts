import { readAudit } from "./audit";
import { recentCommits } from "./github";
import { ok } from "./response";
import type { RepositoryContext } from "./types";

export async function handleDashboardRoute(request: Request, env: Env, context: RepositoryContext, path: string): Promise<Response | null> {
	if (path === "/api/dashboard" && request.method === "GET") {
		const [commits, audit] = await Promise.all([recentCommits(context), readAudit(env)]);
		return ok({ repository: `${context.owner}/${context.repo}`, branch: context.branch, commits, audit });
	}
	if (path === "/api/audit" && request.method === "GET") return ok(await readAudit(env));
	return null;
}
