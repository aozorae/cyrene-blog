import { HttpError } from "./response";
import type { RepositoryContext, RepositorySettings } from "./types";

export interface GitFile {
	path: string;
	content: string;
	sha?: string;
}

export interface GitChange {
	path: string;
	content: string | null;
}

interface GithubCommitRef {
	object: { sha: string };
}

function repository(context: RepositorySettings): string {
	return `${context.owner}/${context.repo}`;
}

function validatePath(path: string): void {
	if (
		!path ||
		path.length > 500 ||
		path.startsWith("/") ||
		path.includes("\\") ||
		path.split("/").includes("..") ||
		/[\u0000-\u001f]/.test(path)
	) {
		throw new HttpError(400, "INVALID_PATH", "提交路径包含不允许的字符。");
	}
}

function encodeBase64Utf8(value: string): string {
	const bytes = new TextEncoder().encode(value);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}

function decodeBase64Utf8(value: string): string {
	const binary = atob(value.replace(/\n/g, ""));
	return new TextDecoder().decode(
		Uint8Array.from(binary, (char) => char.charCodeAt(0)),
	);
}

async function githubRequest<T>(
	context: RepositoryContext,
	path: string,
	init: RequestInit = {},
): Promise<T> {
	if (!context.token)
		throw new HttpError(
			503,
			"GITHUB_NOT_CONFIGURED",
			"GitHub Token 尚未配置。请先在 Worker Secret 中注入 GITHUB_TOKEN。",
		);
	const headers = new Headers(init.headers);
	headers.set("Accept", "application/vnd.github+json");
	headers.set("Authorization", `Bearer ${context.token}`);
	headers.set("User-Agent", "cyrene-admin-worker");
	headers.set("X-GitHub-Api-Version", "2022-11-28");
	if (init.body) headers.set("Content-Type", "application/json");
	let response: Response;
	try {
		response = await fetch(`https://api.github.com${path}`, {
			...init,
			headers,
			signal: AbortSignal.timeout(15_000),
		});
	} catch {
		throw new HttpError(504, "GITHUB_TIMEOUT", "GitHub 请求超时，请稍后重试。");
	}
	if (!response.ok) {
		console.error(
			JSON.stringify({
				source: "github",
				status: response.status,
				requestId: response.headers.get("x-github-request-id"),
			}),
		);
		if (response.status === 401 || response.status === 403)
			throw new HttpError(
				403,
				"GITHUB_FORBIDDEN",
				"GitHub Token 无权访问目标仓库，请检查权限。",
			);
		if (response.status === 404)
			throw new HttpError(
				404,
				"GITHUB_NOT_FOUND",
				"GitHub 仓库、分支或文件不存在，请检查仓库设置。",
			);
		if (response.status === 409 || response.status === 422)
			throw new HttpError(
				409,
				"GITHUB_CONFLICT",
				"GitHub 分支刚刚发生变化，请刷新后重试。",
			);
		throw new HttpError(
			502,
			"GITHUB_ERROR",
			"GitHub 暂时无法完成操作，请稍后重试。",
		);
	}
	if (response.status === 204) return undefined as T;
	return (await response.json()) as T;
}

export function createRepositoryContext(
	env: Env,
	settings: RepositorySettings,
): RepositoryContext {
	return { ...settings, token: env.GITHUB_TOKEN };
}

export async function verifyRepository(
	context: RepositoryContext,
): Promise<void> {
	const repo = await githubRequest<{ permissions?: { push?: boolean } }>(
		context,
		`/repos/${repository(context)}`,
	);
	if (repo.permissions && repo.permissions.push === false)
		throw new HttpError(
			403,
			"GITHUB_READ_ONLY",
			"GitHub Token 只有读取权限，后台需要目标仓库的 Contents 读写权限。",
		);
	await githubRequest(
		context,
		`/repos/${repository(context)}/branches/${encodeURIComponent(context.branch)}`,
	);
}

export async function getBranchHead(
	context: RepositoryContext,
): Promise<string> {
	const ref = await githubRequest<GithubCommitRef>(
		context,
		`/repos/${repository(context)}/git/ref/heads/${encodeURIComponent(context.branch)}`,
	);
	return ref.object.sha;
}

export async function readFile(
	context: RepositoryContext,
	path: string,
): Promise<GitFile> {
	validatePath(path);
	const query = `?ref=${encodeURIComponent(context.branch)}`;
	const result = await githubRequest<{
		content: string;
		sha: string;
		path: string;
	}>(context, `/repos/${repository(context)}/contents/${path}${query}`);
	return {
		path: result.path,
		sha: result.sha,
		content: decodeBase64Utf8(result.content),
	};
}

export async function readOptionalFile(
	context: RepositoryContext,
	path: string,
): Promise<GitFile | null> {
	try {
		return await readFile(context, path);
	} catch (error) {
		if (error instanceof HttpError && error.status === 404) return null;
		throw error;
	}
}

export async function listFiles(
	context: RepositoryContext,
	prefix: string,
): Promise<Array<{ path: string; sha: string }>> {
	validatePath(prefix);
	const tree = await githubRequest<{
		tree: Array<{ path: string; sha: string; type: string }>;
		truncated: boolean;
	}>(
		context,
		`/repos/${repository(context)}/git/trees/${encodeURIComponent(context.branch)}?recursive=1`,
	);
	if (tree.truncated)
		throw new HttpError(
			409,
			"GITHUB_TREE_TRUNCATED",
			"仓库文件过多，GitHub 未返回完整目录，暂时无法安全管理内容。",
		);
	return tree.tree
		.filter(
			(item) => item.type === "blob" && item.path.startsWith(`${prefix}/`),
		)
		.map((item) => ({ path: item.path, sha: item.sha }));
}

export async function deleteFile(
	context: RepositoryContext,
	path: string,
	sha: string,
	message: string,
): Promise<{ sha: string; url: string }> {
	validatePath(path);
	const result = await githubRequest<{
		commit: { sha: string; html_url: string };
	}>(context, `/repos/${repository(context)}/contents/${path}`, {
		method: "DELETE",
		body: JSON.stringify({
			message: message.slice(0, 200),
			sha,
			branch: context.branch,
		}),
	});
	return { sha: result.commit.sha, url: result.commit.html_url };
}

export async function recentCommits(
	context: RepositoryContext,
): Promise<Array<{ sha: string; message: string; date: string; url: string }>> {
	const result = await githubRequest<
		Array<{
			sha: string;
			commit: { message: string; author?: { date?: string } };
			html_url: string;
		}>
	>(
		context,
		`/repos/${repository(context)}/commits?sha=${encodeURIComponent(context.branch)}&per_page=8`,
	);
	return result.map((item) => ({
		sha: item.sha,
		message: item.commit.message.split("\n")[0],
		date: item.commit.author?.date || "",
		url: item.html_url,
	}));
}

export async function commitChanges(
	context: RepositoryContext,
	changes: GitChange[],
	message: string,
	expectedHeadSha?: string,
): Promise<{ sha: string; url: string }> {
	if (changes.length === 0 || changes.length > 30)
		throw new HttpError(
			400,
			"COMMIT_SIZE_INVALID",
			"一次提交必须包含 1 到 30 个文件变更。",
		);
	const totalBytes = changes.reduce(
		(sum, change) =>
			sum +
			(change.content
				? new TextEncoder().encode(change.content).byteLength
				: 0),
		0,
	);
	if (totalBytes > 1_000_000)
		throw new HttpError(
			413,
			"COMMIT_TOO_LARGE",
			"一次提交的内容总量不能超过 1 MB。",
		);
	const uniquePaths = new Set<string>();
	for (const change of changes) {
		validatePath(change.path);
		if (uniquePaths.has(change.path))
			throw new HttpError(
				400,
				"DUPLICATE_PATH",
				`一次提交中出现了重复文件：${change.path}`,
			);
		uniquePaths.add(change.path);
	}
	const parentSha = await getBranchHead(context);
	if (expectedHeadSha && parentSha !== expectedHeadSha)
		throw new HttpError(
			409,
			"GITHUB_CONFLICT",
			"GitHub 分支刚刚发生变化，请刷新后重试。",
		);
	const parentCommit = await githubRequest<{ tree: { sha: string } }>(
		context,
		`/repos/${repository(context)}/git/commits/${parentSha}`,
	);
	const treeEntries = await Promise.all(
		changes.map(
			async (
				change,
			): Promise<{
				path: string;
				mode: "100644";
				type: "blob";
				sha: string | null;
			}> => {
				if (change.content === null)
					return { path: change.path, mode: "100644", type: "blob", sha: null };
				const blob = await githubRequest<{ sha: string }>(
					context,
					`/repos/${repository(context)}/git/blobs`,
					{
						method: "POST",
						body: JSON.stringify({
							content: encodeBase64Utf8(change.content),
							encoding: "base64",
						}),
					},
				);
				return {
					path: change.path,
					mode: "100644",
					type: "blob",
					sha: blob.sha,
				};
			},
		),
	);
	const tree = await githubRequest<{ sha: string }>(
		context,
		`/repos/${repository(context)}/git/trees`,
		{
			method: "POST",
			body: JSON.stringify({
				base_tree: parentCommit.tree.sha,
				tree: treeEntries,
			}),
		},
	);
	const commit = await githubRequest<{ sha: string; html_url: string }>(
		context,
		`/repos/${repository(context)}/git/commits`,
		{
			method: "POST",
			body: JSON.stringify({
				message:
					message.trim().slice(0, 200) || "Update blog from Cyrene Admin",
				tree: tree.sha,
				parents: [parentSha],
			}),
		},
	);
	await githubRequest(
		context,
		`/repos/${repository(context)}/git/refs/heads/${encodeURIComponent(context.branch)}`,
		{
			method: "PATCH",
			body: JSON.stringify({ sha: commit.sha, force: false }),
		},
	);
	return { sha: commit.sha, url: commit.html_url };
}
