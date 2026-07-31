import { saveDraftRecord, submitDraftIds, findDraft } from "../core/drafts.js";
import { initializeAdminPage, pageQuery } from "../core/page.js";
import { $, escapeHtml, setBusy, setStatus, showToast } from "../core/ui.js";
import { createUnsavedChangesNotice } from "../features/unsaved-changes-notice.js";

let settingsRevision = {};
let unsavedChanges = null;

function addMethodRow(method = {}) {
	const container = $("#sponsor-methods");
	const row = document.createElement("div");
	row.className = "method-row";
	row.innerHTML = `<div class="method-row-head"><span class="method-number">${container.children.length + 1}</span><button type="button" class="remove-method" aria-label="删除这个打赏方式">移除</button></div><div class="field-grid"><div class="field"><label>名称</label><input data-method="name" maxlength="80" value="${escapeHtml(method.name)}" /></div><div class="field"><label>图标名称</label><input data-method="icon" maxlength="100" value="${escapeHtml(method.icon)}" /></div><div class="field"><label>二维码 URL</label><input data-method="qrCode" maxlength="500" value="${escapeHtml(method.qrCode)}" /></div><div class="field"><label>外部链接</label><input data-method="link" maxlength="500" value="${escapeHtml(method.link)}" /></div><div class="field field-full"><label>说明</label><input data-method="description" maxlength="240" value="${escapeHtml(method.description)}" /></div></div>`;
	row.querySelector(".remove-method").addEventListener("click", () => {
		row.remove();
		document.querySelectorAll(".method-number").forEach((element, index) => {
			element.textContent = String(index + 1);
		});
	});
	container.appendChild(row);
}

function renderSettings(settings) {
	$("#site-title").value = settings.title || "";
	$("#site-subtitle").value = settings.subtitle || "";
	$("#site-url").value = settings.siteUrl || "";
	$("#site-description").value = settings.description || "";
	$("#profile-name").value = settings.profileName || "";
	$("#profile-bio").value = settings.profileBio || "";
	$("#github-url").value = settings.githubUrl || "";
	$("#announcement").value = settings.announcement || "";
	$("#announcement-link").value = settings.announcementLink || "/about/";
	const pageNames = { dynamic: "动态", sponsor: "打赏", friends: "友链", guestbook: "留言", gallery: "相册", anime: "追番", bangumi: "番组计划" };
	$("#page-toggles").innerHTML = Object.entries(pageNames)
		.map(([key, label]) => `<label class="toggle-card"><span><strong>${label}</strong><small>${key === "dynamic" ? "保留现有动态内容" : "个人数据页面"}</small></span><input type="checkbox" data-page="${key}" ${settings.pages?.[key] ? "checked" : ""} /><i></i></label>`)
		.join("");
	$("#sponsor-methods").innerHTML = "";
	(settings.sponsorMethods || []).forEach(addMethodRow);
}

function collectSettings() {
	const pages = {};
	document.querySelectorAll("[data-page]").forEach((input) => {
		pages[input.dataset.page] = input.checked;
	});
	const sponsorMethods = [...document.querySelectorAll(".method-row")]
		.map((row) => {
			const value = (name) => row.querySelector(`[data-method="${name}"]`)?.value.trim() || "";
			return { name: value("name"), icon: value("icon"), qrCode: value("qrCode"), link: value("link"), description: value("description") };
		})
		.filter((method) => method.name);
	return {
		title: $("#site-title").value.trim(),
		subtitle: $("#site-subtitle").value.trim(),
		siteUrl: $("#site-url").value.trim(),
		description: $("#site-description").value.trim(),
		profileName: $("#profile-name").value.trim(),
		profileBio: $("#profile-bio").value.trim(),
		githubUrl: $("#github-url").value.trim(),
		announcement: $("#announcement").value.trim(),
		announcementLink: $("#announcement-link").value.trim(),
		pages,
		sponsorMethods,
	};
}

async function saveSettingsDraft() {
	const result = await saveDraftRecord({
		id: "settings:main",
		kind: "settings",
		title: "站点设置",
		path: "src/config",
		payload: { settings: collectSettings() },
		baseRevision: settingsRevision,
	});
	settingsRevision = result.draft.baseRevision;
	unsavedChanges?.markSaved();
	showToast(result.message);
	return result.draft;
}

async function main() {
	const context = await initializeAdminPage({ id: "settings", eyebrow: "LEGACY SETTINGS", title: "兼容设置", icon: "settings-2" });
	if (!context) return;
	const draft = findDraft(context.drafts, pageQuery().get("draft"), "settings");
	settingsRevision = draft?.baseRevision || context.config.revision;
	renderSettings(draft?.payload.settings || context.config.settings);
	unsavedChanges = createUnsavedChangesNotice(collectSettings);
	const scheduleUnsavedCheck = () => queueMicrotask(() => unsavedChanges?.check());
	const form = $("#settings-form");
	form.addEventListener("input", scheduleUnsavedCheck);
	form.addEventListener("change", scheduleUnsavedCheck);
	form.addEventListener("click", (event) => {
		if (event.target.closest(".remove-method")) scheduleUnsavedCheck();
	});
	$("#add-method").addEventListener("click", () => {
		addMethodRow();
		unsavedChanges.check();
	});
	$("#settings-draft-save").addEventListener("click", async (event) => {
		setBusy(event.currentTarget, true);
		setStatus("#settings-status", "保存中…");
		try {
			await saveSettingsDraft();
			setStatus("#settings-status", "草稿已保存。", "success");
		} catch (error) {
			setStatus("#settings-status", error.message, "error");
		} finally {
			setBusy(event.currentTarget, false);
		}
	});
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		setBusy(event.submitter, true);
		setStatus("#settings-status", "提交中…");
		try {
			const draftRecord = await saveSettingsDraft();
			const result = await submitDraftIds([draftRecord.id]);
			setStatus("#settings-status", result.message, "success");
			showToast(result.message);
		} catch (error) {
			setStatus("#settings-status", error.message, "error");
		} finally {
			setBusy(event.submitter, false);
		}
	});
}

main();
