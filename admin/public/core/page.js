import { api } from "./api.js";
import { initializeI18n } from "./i18n.js";
import { mountShell, revealShell, updateShellContext } from "../layout/shell.js";
import { showToast } from "./ui.js";

function currentReturnPath() {
	return `${window.location.pathname}${window.location.search}`;
}

export function loginUrl() {
	return `/?return=${encodeURIComponent(currentReturnPath())}`;
}

export async function initializeAdminPage(page, options = {}) {
	initializeI18n();
	mountShell(page);
	try {
		const session = await api("/api/auth/me");
		if (!session.authenticated) {
			window.location.replace(loginUrl());
			return null;
		}
		const setup = await api("/api/setup");
		if (!setup.configured && !options.allowUnconfigured) {
			window.location.replace("/setup.html");
			return null;
		}
		let drafts = [];
		let config = null;
		if (setup.configured) {
			[drafts, config] = await Promise.all([api("/api/drafts"), api("/api/config")]);
		}
		updateShellContext({ setup, drafts, config, navigationDisabled: !setup.configured });
		revealShell();
		return { setup, drafts, config };
	} catch (error) {
		if (error.status === 401) {
			window.location.replace(loginUrl());
			return null;
		}
		if (error.code === "SETUP_REQUIRED" && !options.allowUnconfigured) {
			window.location.replace("/setup.html");
			return null;
		}
		showToast(error.message, "error");
		throw error;
	}
}

export function pageQuery() {
	return new URLSearchParams(window.location.search);
}
