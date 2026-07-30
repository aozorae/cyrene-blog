const source = document.querySelector("#article-content");

let editor = null;
let initialization = null;
let pendingValue = source?.value || "";
let ready = false;

function syncSource(value) {
	pendingValue = String(value || "");
	if (source) source.value = pendingValue;
}

function syncPreviewMode() {
	if (!ready) return;
	editor.setPreviewMode(
		window.matchMedia("(max-width: 620px)").matches ? "editor" : "both",
	);
}

window.addEventListener("resize", syncPreviewMode);

export function ensureArticleEditor() {
	if (ready) return Promise.resolve(editor);
	if (initialization) return initialization;
	initialization = new Promise((resolve, reject) => {
		if (!window.Vditor) {
			reject(new Error("Vditor 编辑器资源加载失败，请刷新页面后重试。"));
			return;
		}
			editor = new window.Vditor("article-content-editor", {
			after: () => {
				ready = true;
				editor.setValue(pendingValue);
				syncPreviewMode();
				syncSource(pendingValue);
				resolve(editor);
			},
			cache: { enable: false },
			cdn: "/vendor/vditor",
			counter: { enable: true, type: "markdown" },
			height: 520,
			input: (value) => syncSource(value),
			lang: "zh_CN",
			mode: "sv",
			placeholder: "# 从这里开始\n\n记录你的想法、过程和结论。",
			preview: { delay: 300, mode: "both" },
			resize: { enable: true, position: "bottom" },
			toolbar: [
				"headings",
				"bold",
				"italic",
				"strike",
				"link",
				"|",
				"list",
				"ordered-list",
				"check",
				"quote",
				"line",
				"|",
				"code",
				"inline-code",
				"table",
				"|",
				"undo",
				"redo",
				"|",
				"both",
				"fullscreen",
			],
		});
	}).catch((error) => {
		editor = null;
		initialization = null;
		ready = false;
		throw error;
	});
	return initialization;
}

export function getArticleContent() {
	const value = ready ? editor.getValue() : pendingValue;
	syncSource(value);
	return value;
}

export function setArticleContent(value) {
	syncSource(value);
	if (ready) editor.setValue(pendingValue);
}

export function resetArticleContent() {
	setArticleContent("");
}

export function focusArticleEditor() {
	ensureArticleEditor()
		.then((instance) => instance.focus())
		.catch(() => {});
}
