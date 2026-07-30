import { api } from "../core/api.js";
import { initializeAdminPage } from "../core/page.js";
import { showToast } from "../core/ui.js";
import { auditRows, commitRows } from "../features/activity-renderer.js";

async function main() {
	const context = await initializeAdminPage({
		id: "dashboard",
		eyebrow: "OVERVIEW",
		title: "仪表盘",
		icon: "layout-dashboard",
	});
	if (!context) return;
	try {
		const [dashboard, articles, dynamics] = await Promise.all([
			api("/api/dashboard"),
			api("/api/articles"),
			api("/api/dynamics"),
		]);
		document.querySelector("#dashboard-article-count").textContent = String(articles.length);
		document.querySelector("#dashboard-dynamic-count").textContent = String(dynamics.length);
		document.querySelector("#dashboard-draft-count").textContent = String(context.drafts.length);
		document.querySelector("#dashboard-commit-count").textContent = String(dashboard.commits?.length || 0);
		document.querySelector("#dashboard-repository").textContent = dashboard.repository;
		document.querySelector("#dashboard-branch").textContent = dashboard.branch;
		document.querySelector("#dashboard-commit-list").innerHTML = commitRows(dashboard.commits, 5);
		document.querySelector("#dashboard-audit-list").innerHTML = auditRows(dashboard.audit, 5);
	} catch (error) {
		showToast(error.message, "error");
	}
}

main();
