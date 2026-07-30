import { api } from "../core/api.js";
import { $, setBusy, setStatus } from "../core/ui.js";

function destination() {
	const value = new URLSearchParams(window.location.search).get("return") || "";
	return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard.html";
}

async function redirectAuthenticatedUser() {
	const session = await api("/api/auth/me");
	if (!session.authenticated) return;
	const setup = await api("/api/setup");
	window.location.replace(setup.configured ? destination() : "/setup.html");
}

$("#login-form").addEventListener("submit", async (event) => {
	event.preventDefault();
	const button = event.submitter;
	setStatus("#login-error", "");
	setBusy(button, true);
	try {
		await api("/api/auth/login", {
			method: "POST",
			body: JSON.stringify({ password: $("#admin-password").value }),
		});
		$("#admin-password").value = "";
		const setup = await api("/api/setup");
		window.location.replace(setup.configured ? destination() : "/setup.html");
	} catch (error) {
		setStatus("#login-error", error.message, "error");
	} finally {
		setBusy(button, false);
	}
});

redirectAuthenticatedUser().catch(() => {});
