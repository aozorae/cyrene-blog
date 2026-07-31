import { getLocale, translateText } from "./i18n.js";

export const $ = (selector, root = document) => root.querySelector(selector);

export function showToast(message, type = "success") {
	const toast = $("#toast");
	if (!toast) return;
	toast.textContent = translateText(message);
	toast.dataset.type = type;
	toast.classList.add("toast-visible");
	window.setTimeout(() => toast.classList.remove("toast-visible"), 3600);
}

export function setStatus(selector, message, type = "") {
	const element = $(selector);
	if (!element) return;
	element.textContent = translateText(message);
	element.dataset.type = type;
}

export function setBusy(button, busy) {
	if (!button) return;
	button.disabled = busy;
	button.classList.toggle("is-busy", busy);
}

export function escapeHtml(value) {
	return String(value ?? "").replace(
		/[&<>'"]/g,
		(char) =>
			({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
				char
			],
	);
}

export function formatDate(value) {
	if (!value) return "—";
	return new Intl.DateTimeFormat(getLocale(), {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}
