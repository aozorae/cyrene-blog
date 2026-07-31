const TOOLBAR = [
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
];

export function createMarkdownEditor({ editorId, sourceId, placeholder }) {
	const source = document.getElementById(sourceId);
	const host = document.getElementById(editorId);
	if (!source || !host) throw new Error("Markdown 编辑器挂载点缺失。");

	let editor = null;
	let initialization = null;
	let pendingValue = source.value || "";
	let ready = false;

	function syncSource(value) {
		pendingValue = String(value ?? "");
		source.value = pendingValue;
	}

	function syncPreviewMode() {
		if (!ready) return;
		editor.setPreviewMode(
			window.matchMedia("(max-width: 620px)").matches ? "editor" : "both",
		);
	}

	window.addEventListener("resize", syncPreviewMode);

	function ensure() {
		if (ready) return Promise.resolve(editor);
		if (initialization) return initialization;
		initialization = new Promise((resolve, reject) => {
			if (!window.Vditor) {
				reject(new Error("Vditor 编辑器资源加载失败，请刷新页面后重试。"));
				return;
			}
			editor = new window.Vditor(editorId, {
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
				placeholder,
				preview: { delay: 300, mode: "both" },
				resize: { enable: true, position: "bottom" },
				toolbar: TOOLBAR,
			});
		}).catch((error) => {
			editor = null;
			initialization = null;
			ready = false;
			throw error;
		});
		return initialization;
	}

	function getValue() {
		const value = ready ? editor.getValue() : pendingValue;
		syncSource(value);
		return value;
	}

	function setValue(value) {
		syncSource(value);
		if (ready) editor.setValue(pendingValue);
	}

	function focus() {
		ensure()
			.then((instance) => instance.focus())
			.catch(() => {});
	}

	return {
		ensure,
		focus,
		getValue,
		reset: () => setValue(""),
		setValue,
	};
}
