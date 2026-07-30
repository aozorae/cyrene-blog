import { escapeHtml, formatDate } from "../core/ui.js";

export function commitRows(commits = [], limit = commits.length) {
	return commits.length
		? commits
				.slice(0, limit)
				.map(
					(commit) =>
						`<a class="activity-row" href="${escapeHtml(commit.url)}" target="_blank" rel="noreferrer"><span class="activity-mark"><svg class="icon" aria-hidden="true"><use href="/icons.svg#git-commit-horizontal"></use></svg></span><span class="activity-content"><strong>${escapeHtml(commit.message)}</strong><small>${formatDate(commit.date)} · ${escapeHtml(commit.sha.slice(0, 7))}</small></span></a>`,
				)
				.join("")
		: '<p class="empty-copy">还没有读取到提交记录。</p>';
}

export function auditRows(audit = [], limit = audit.length) {
	return audit.length
		? audit
				.slice(0, limit)
				.map(
					(item) =>
						`<div class="activity-row"><span class="activity-mark">${item.status === "success" ? "✓" : "!"}</span><span class="activity-content"><strong>${escapeHtml(item.detail)}</strong><small>${escapeHtml(item.action)} · ${formatDate(item.createdAt)}</small></span></div>`,
				)
				.join("")
		: '<p class="empty-copy">后台操作记录会出现在这里。</p>';
}
