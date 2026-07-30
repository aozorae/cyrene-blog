import { api } from "../core/api.js";
import { initializeAdminPage } from "../core/page.js";
import { showToast } from "../core/ui.js";
import { auditRows, commitRows } from "../features/activity-renderer.js";

async function main() {
	const context = await initializeAdminPage({
		id: "activity",
		eyebrow: "ACTIVITY",
		title: "提交记录",
		icon: "history",
	});
	if (!context) return;
	try {
		const dashboard = await api("/api/dashboard");
		document.querySelector("#commit-list").innerHTML = commitRows(dashboard.commits);
		document.querySelector("#audit-list").innerHTML = auditRows(dashboard.audit);
	} catch (error) {
		showToast(error.message, "error");
	}
}

main();
