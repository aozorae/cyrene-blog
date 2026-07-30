import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const workerName = process.env.WORKER_NAME;
const databaseName = process.env.D1_DATABASE_NAME;
if (!workerName || !databaseName) throw new Error("WORKER_NAME 和 D1_DATABASE_NAME 必须由部署流程提供。");

const cwd = resolve(import.meta.dirname, "..");
const executable = process.platform === "win32" ? "corepack.cmd" : "corepack";

function wrangler(args, capture = false) {
	return execFileSync(executable, ["pnpm", "exec", "wrangler", ...args], {
		cwd,
		env: process.env,
		encoding: "utf8",
		stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
	});
}

function findDatabaseId() {
	const databases = JSON.parse(wrangler(["d1", "list", "--json"], true));
	const database = databases.find((item) => item.name === databaseName);
	return database?.uuid || database?.id || null;
}

let databaseId = findDatabaseId();
if (!databaseId) {
	wrangler(["d1", "create", databaseName, "--use-remote", "--binding", "DB"]);
	databaseId = findDatabaseId();
}
if (!databaseId) throw new Error(`无法创建或查找 D1 数据库 ${databaseName}。`);

const templatePath = resolve(cwd, "wrangler.jsonc");
const outputPath = resolve(cwd, "wrangler.generated.jsonc");
const config = JSON.parse(readFileSync(templatePath, "utf8"));
config.name = workerName;
config.d1_databases = [{
	binding: "DB",
	database_name: databaseName,
	database_id: databaseId,
	migrations_dir: "./migrations",
}];
writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
console.log(`已准备 Worker ${workerName} 与 D1 ${databaseName}。`);
