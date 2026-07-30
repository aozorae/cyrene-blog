import { writeAudit } from "./audit";
import { listPublishedContent, readArticle, validateDeletePath } from "./content-service";
import { deleteFile, readFile } from "./github";
import { HttpError, ok } from "./response";
import type { RepositoryContext } from "./types";

export async function handleContentRoute(request: Request, env: Env, context: RepositoryContext, path: string, url: URL): Promise<Response | null> {
	if (path === "/api/articles" && request.method === "GET") return ok(await listPublishedContent(context, "posts"));
	if (path === "/api/article" && request.method === "GET") {
		const articlePath = url.searchParams.get("path") || "";
		return ok(await readArticle(context, articlePath));
	}
	if (path === "/api/articles" && request.method === "DELETE") {
		const articlePath = validateDeletePath(url.searchParams.get("path") || "", "posts");
		const file = await readFile(context, articlePath);
		const commit = await deleteFile(context, articlePath, file.sha || "", `Delete article: ${articlePath}`);
		await writeAudit(env, "article.delete", `删除文章：${articlePath}`, commit.sha);
		return ok({ commit, message: "已经提交，自动部署。" });
	}
	if (path === "/api/dynamics" && request.method === "GET") return ok(await listPublishedContent(context, "dynamic"));
	if (path === "/api/dynamics" && request.method === "DELETE") {
		const dynamicPath = validateDeletePath(url.searchParams.get("path") || "", "dynamic");
		if (!/^src\/content\/dynamic\/\d{4}-\d{2}-\d{2}-\d{6}\.md$/.test(dynamicPath)) throw new HttpError(400, "INVALID_DYNAMIC", "动态文件名格式无效。");
		const file = await readFile(context, dynamicPath);
		const commit = await deleteFile(context, dynamicPath, file.sha || "", `Delete dynamic: ${dynamicPath}`);
		await writeAudit(env, "dynamic.delete", `删除动态：${dynamicPath}`, commit.sha);
		return ok({ commit, message: "已经提交，自动部署。" });
	}
	return null;
}
