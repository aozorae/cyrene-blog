import { readRepositorySettings, saveRepositorySettings, validateRepositorySettings } from "./admin-settings";
import { writeAudit } from "./audit";
import { createRepositoryContext, verifyRepository } from "./github";
import { ok, readJson } from "./response";

export async function handleSetupRoute(request: Request, env: Env, path: string): Promise<Response | null> {
	if (path !== "/api/setup") return null;
	if (request.method === "GET") {
		const settings = await readRepositorySettings(env);
		return ok({ configured: Boolean(settings), settings });
	}
	if (request.method === "PUT") {
		const settings = validateRepositorySettings(await readJson(request, 20_000));
		await verifyRepository(createRepositoryContext(env, settings));
		await saveRepositorySettings(env, settings);
		await writeAudit(env, "setup.update", `连接 GitHub 仓库：${settings.owner}/${settings.repo}#${settings.branch}`, null);
		return ok({ configured: true, settings, message: "仓库连接成功。" });
	}
	return null;
}
