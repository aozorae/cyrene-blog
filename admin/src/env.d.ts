/**
 * Wrangler 不会把 Secret 写入生成的绑定类型，因此在这里补充 Secret 的类型声明；
 * Secret 仍然只通过 `wrangler secret put` 注入，避免凭据进入源码或配置文件。
 */
interface Env {
	ADMIN_PASSWORD: string;
	SESSION_SECRET: string;
	GITHUB_TOKEN: string;
	DB: D1Database;
	ASSETS: Fetcher;
}
