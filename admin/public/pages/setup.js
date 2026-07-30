import { api } from "../core/api.js";
import { initializeAdminPage, pageQuery } from "../core/page.js";
import { $, setBusy, setStatus, showToast } from "../core/ui.js";

function returnPath() {
	const value = pageQuery().get("return") || "";
	return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard.html";
}

async function main() {
	const context = await initializeAdminPage(
		{ id: "setup", eyebrow: "REPOSITORY", title: "连接博客仓库", icon: "settings" },
		{ allowUnconfigured: true },
	);
	if (!context) return;
	const settings = context.setup.settings || {};
	$("#setup-owner").value = settings.owner || "";
	$("#setup-repo").value = settings.repo || "";
	$("#setup-branch").value = settings.branch || "main";
	const cancel = $("#setup-cancel");
	cancel.href = returnPath();
	cancel.classList.toggle("hidden", !context.setup.configured);

	$("#setup-form").addEventListener("submit", async (event) => {
		event.preventDefault();
		const button = event.submitter;
		setBusy(button, true);
		setStatus("#setup-status", "正在验证 GitHub 权限…");
		try {
			const result = await api("/api/setup", {
				method: "PUT",
				body: JSON.stringify({
					owner: $("#setup-owner").value,
					repo: $("#setup-repo").value,
					branch: $("#setup-branch").value,
				}),
			});
			showToast(result.message);
			window.location.replace(returnPath());
		} catch (error) {
			setStatus("#setup-status", error.message, "error");
		} finally {
			setBusy(button, false);
		}
	});
}

main();
