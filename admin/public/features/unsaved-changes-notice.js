const NOTICE_ID = "unsaved-changes-notice";
const NOTICE_MESSAGE = "您的更改没有保存、存入草稿或提交到 GitHub。";

function snapshot(value) {
	return JSON.stringify(value);
}

function mountNotice() {
	const existing = document.getElementById(NOTICE_ID);
	if (existing) return existing;
	const notice = document.createElement("div");
	notice.id = NOTICE_ID;
	notice.className = "unsaved-changes-notice";
	notice.hidden = true;
	notice.setAttribute("role", "status");
	notice.setAttribute("aria-live", "polite");
	notice.setAttribute("aria-atomic", "true");
	notice.innerHTML = '<span class="unsaved-changes-dot" aria-hidden="true"></span><span></span>';
	notice.lastElementChild.textContent = NOTICE_MESSAGE;
	document.body.appendChild(notice);
	return notice;
}

export function createUnsavedChangesNotice(getCurrentValue) {
	const notice = mountNotice();
	let savedSnapshot = snapshot(getCurrentValue());

	function setVisible(visible) {
		notice.hidden = !visible;
	}

	return {
		check() {
			setVisible(snapshot(getCurrentValue()) !== savedSnapshot);
		},
		markSaved() {
			savedSnapshot = snapshot(getCurrentValue());
			setVisible(false);
		},
	};
}
