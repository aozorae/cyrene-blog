import {
	formatStudioItemTitle,
	getStudioArrayTemplate,
	getStudioDocumentGuide,
	getStudioFieldPresentation,
	getStudioFieldSchema,
	getStudioObjectExtraFields,
	isStudioFieldVisible,
} from "./studio-field-schema.js";

let active = null;
let boundContainer = null;

export function renderStudioForm(container, options) {
	active = {
		container,
		doc: options.doc,
		navigationTitle: options.navigationTitle,
		fieldInfo: options.fieldInfo,
		escapeHtml: options.escapeHtml,
		values: structuredClone(options.doc.exports || {}),
	};
	bindContainer(container);
	renderActiveForm();
}

export function collectStudioFormValues() {
	if (!active) throw new Error("配置表单尚未加载完成。");
	return normalizeCollectedValue(active.values);
}

function bindContainer(container) {
	if (boundContainer === container) return;
	boundContainer = container;
	container.addEventListener("input", updateFieldFromInput);
	container.addEventListener("change", updateFieldFromInput);
	container.addEventListener("click", handleFormAction);
}

function renderActiveForm() {
	const { container, doc, navigationTitle, escapeHtml } = active;
	const guide = getStudioDocumentGuide(doc.path);
	const guideLink = guide
		? `<a class="studio-guide-link" href="${escapeHtml(guide)}" target="_blank" rel="noreferrer"><svg class="icon" aria-hidden="true"><use href="/icons.svg#external-link"></use></svg><span>查看配置说明</span></a>`
		: "";
	const header = `<div class="studio-copy"><div><strong>${escapeHtml(navigationTitle || doc.title)}</strong><span>${escapeHtml(doc.description)}</span><small>${escapeHtml(doc.path)}</small></div>${guideLink}</div>`;
	if (doc.text) {
		container.innerHTML = `${header}<div class="studio-field studio-html-field"><label>页脚 HTML 内容<small>这是高级自定义内容，保持原 HTML 形式保存；不需要配置时可以留空。</small></label><textarea data-studio-kind="string" data-studio-path="content" rows="16">${escapeHtml(active.values.content || "")}</textarea></div>`;
		return;
	}
	const body = Object.entries(active.values)
		.map(([key, value]) => renderValue(value, key, 0))
		.join("");
	container.innerHTML = `${header}<div class="studio-form-body">${body || '<p class="empty-copy">这个文件没有可编辑的配置项。</p>'}</div>`;
}

function renderValue(value, path, depth) {
	if (!isStudioFieldVisible(path, active.values)) return "";
	if (Array.isArray(value)) return renderArray(value, path, depth);
	if (value && typeof value === "object")
		return renderObject(value, path, depth);
	return renderScalar(value, path, depth);
}

function renderObject(value, path, depth) {
	const meta = fieldMeta(path, value);
	const extras = getStudioObjectExtraFields(path);
	const keys = [
		...Object.keys(value),
		...Object.keys(extras).filter((key) => !Object.hasOwn(value, key)),
	];
	const fields = keys
		.map((key) => {
			const childValue = Object.hasOwn(value, key) ? value[key] : extras[key];
			return renderValue(childValue, `${path}.${key}`, depth + 1);
		})
		.join("");
	return `<section class="studio-group ${depth ? "studio-nested" : ""}"><div class="studio-group-title"><strong>${active.escapeHtml(meta.label)}</strong><small>${active.escapeHtml(meta.help)}</small></div>${fields || '<p class="studio-empty-inline">暂无可配置字段。</p>'}</section>`;
}

function renderArray(items, path, depth) {
	const meta = fieldMeta(path, items);
	const primitive = items.every(
		(item) => item === null || !["object", "function"].includes(typeof item),
	);
	const rows = items
		.map((item, index) =>
			primitive
				? renderPrimitiveArrayItem(item, path, index)
				: renderObjectArrayItem(item, path, index, depth),
		)
		.join("");
	return `<section class="studio-array ${depth ? "studio-nested" : ""}" data-studio-array="${active.escapeHtml(path)}"><div class="studio-array-heading"><div><strong>${active.escapeHtml(meta.label)}</strong><small>${active.escapeHtml(meta.help)}</small></div><button class="button button-primary compact-button" type="button" data-studio-action="add" data-studio-array-path="${active.escapeHtml(path)}">添加项目</button></div><div class="studio-array-items">${rows || '<p class="studio-empty-inline">暂无项目，可以点击右上角添加。</p>'}</div></section>`;
}

function renderPrimitiveArrayItem(value, path, index) {
	const itemPath = `${path}.${index}`;
	const meta = fieldMeta(itemPath, value);
	const control = renderScalarControl(value, itemPath, meta, true);
	return `<div class="studio-list-row"><span class="studio-list-index">${index + 1}</span><div class="studio-list-control">${control}</div>${renderArrayActions(path, index)}</div>`;
}

function renderObjectArrayItem(item, path, index, depth) {
	const itemPath = `${path}.${index}`;
	const fields = renderObjectFields(item, itemPath, depth + 1);
	return `<article class="studio-array-card"><div class="studio-array-card-heading"><strong>${active.escapeHtml(formatStudioItemTitle(item, index))}</strong>${renderArrayActions(path, index)}</div><div class="studio-array-card-body">${fields}</div></article>`;
}

function renderObjectFields(value, path, depth) {
	const extras = getStudioObjectExtraFields(path);
	const keys = [
		...Object.keys(value),
		...Object.keys(extras).filter((key) => !Object.hasOwn(value, key)),
	];
	return keys
		.map((key) => {
			const childValue = Object.hasOwn(value, key) ? value[key] : extras[key];
			return renderValue(childValue, `${path}.${key}`, depth);
		})
		.join("");
}

function renderArrayActions(path, index) {
	const length = getByPath(active.values, path)?.length || 0;
	return `<div class="studio-item-actions"><button type="button" title="上移" aria-label="上移" data-studio-action="up" data-studio-array-path="${active.escapeHtml(path)}" data-studio-index="${index}" ${index === 0 ? "disabled" : ""}><svg class="icon" aria-hidden="true"><use href="/icons.svg#chevron-up"></use></svg></button><button type="button" title="下移" aria-label="下移" data-studio-action="down" data-studio-array-path="${active.escapeHtml(path)}" data-studio-index="${index}" ${index === length - 1 ? "disabled" : ""}><svg class="icon" aria-hidden="true"><use href="/icons.svg#chevron-down"></use></svg></button><button class="studio-remove-item" type="button" title="删除" aria-label="删除" data-studio-action="remove" data-studio-array-path="${active.escapeHtml(path)}" data-studio-index="${index}"><svg class="icon" aria-hidden="true"><use href="/icons.svg#trash-2"></use></svg></button></div>`;
}

function renderScalar(value, path, depth) {
	const meta = fieldMeta(path, value);
	if (meta.readonly) {
		return `<div class="studio-field ${depth ? "studio-nested-field" : ""}"><label>${active.escapeHtml(meta.label)}<small>${active.escapeHtml(meta.help)}</small></label><div class="studio-readonly-value">${active.escapeHtml(value ?? "未设置")}</div></div>`;
	}
	if (typeof value === "boolean")
		return renderBoolean(value, path, meta, depth);
	return `<div class="studio-field ${depth ? "studio-nested-field" : ""}"><label for="${fieldId(path)}">${active.escapeHtml(meta.label)}<small>${active.escapeHtml(meta.help)}</small></label>${renderScalarControl(value, path, meta)}</div>`;
}

function renderBoolean(value, path, meta, depth) {
	return `<label class="studio-toggle ${depth ? "studio-nested-field" : ""}"><span><strong>${active.escapeHtml(meta.label)}</strong><small>${active.escapeHtml(meta.help)}</small></span><input id="${fieldId(path)}" type="checkbox" data-studio-kind="boolean" data-studio-path="${active.escapeHtml(path)}" ${value ? "checked" : ""} /><i aria-hidden="true"></i></label>`;
}

function renderScalarControl(value, path, meta, compact = false) {
	const escapedPath = active.escapeHtml(path);
	const escapedValue = active.escapeHtml(value ?? "");
	if (meta.options?.length) {
		const options = [...meta.options];
		if (!options.some((option) => String(option.value) === String(value))) {
			options.push({
				value: String(value ?? ""),
				label: `当前值：${String(value ?? "未设置")}`,
			});
		}
		if (options.length <= 4 && !compact) {
			return `<div class="studio-choice-group" role="radiogroup">${options.map((option) => `<label><input type="radio" name="${fieldId(path)}" data-studio-kind="string" data-studio-path="${escapedPath}" value="${active.escapeHtml(option.value)}" ${String(value) === String(option.value) ? "checked" : ""} /><span>${active.escapeHtml(option.label)}</span></label>`).join("")}</div>`;
		}
		return `<select id="${fieldId(path)}" data-studio-kind="string" data-studio-path="${escapedPath}">${options.map((option) => `<option value="${active.escapeHtml(option.value)}" ${String(value) === String(option.value) ? "selected" : ""}>${active.escapeHtml(option.label)}</option>`).join("")}</select>`;
	}
	if (typeof value === "number") {
		const min = meta.min ?? "";
		const max = meta.max ?? "";
		const step = meta.step ?? "any";
		if (min !== "" && max !== "" && !compact) {
			const visual =
				meta.visual === "hue"
					? `<span class="studio-color-swatch" data-studio-swatch="${escapedPath}" style="background:hsl(${Number(value)} 70% 50%)"></span>`
					: "";
			return `<div class="studio-range-control">${visual}<input type="range" data-studio-kind="number" data-studio-path="${escapedPath}" min="${min}" max="${max}" step="${step}" value="${escapedValue}" /><span class="studio-number-input"><input id="${fieldId(path)}" type="number" data-studio-kind="number" data-studio-path="${escapedPath}" min="${min}" max="${max}" step="${step}" value="${escapedValue}" /><em>${active.escapeHtml(meta.unit || "")}</em></span></div>`;
		}
		return `<input id="${fieldId(path)}" type="number" data-studio-kind="number" data-studio-path="${escapedPath}" ${min !== "" ? `min="${min}"` : ""} ${max !== "" ? `max="${max}"` : ""} step="${step}" value="${escapedValue}" />`;
	}
	if (meta.type === "textarea")
		return `<textarea id="${fieldId(path)}" data-studio-kind="string" data-studio-path="${escapedPath}" rows="${meta.rows || 3}">${escapedValue}</textarea>`;
	if (meta.suggestions?.length) {
		const listId = `${fieldId(path)}-suggestions`;
		return `<input id="${fieldId(path)}" type="${meta.type || "text"}" list="${listId}" data-studio-kind="string" data-studio-path="${escapedPath}" value="${escapedValue}" /><datalist id="${listId}">${meta.suggestions.map((option) => `<option value="${active.escapeHtml(option.value)}">${active.escapeHtml(option.label)}</option>`).join("")}</datalist>`;
	}
	return `<input id="${fieldId(path)}" type="${meta.type || "text"}" data-studio-kind="string" data-studio-path="${escapedPath}" value="${escapedValue}" ${meta.autocomplete ? `autocomplete="${active.escapeHtml(meta.autocomplete)}"` : ""} />`;
}

function fieldMeta(path, value) {
	return {
		...active.fieldInfo(path),
		...getStudioFieldPresentation(path),
		...getStudioFieldSchema(path, value),
	};
}

function updateFieldFromInput(event) {
	const input = event.target.closest("[data-studio-path]");
	if (!input || !active?.container.contains(input)) return;
	let value;
	if (input.dataset.studioKind === "boolean") value = input.checked;
	else if (input.dataset.studioKind === "number") {
		value = input.value === "" ? 0 : Number(input.value);
		if (!Number.isFinite(value)) return;
	} else value = input.value;
	setByPath(active.values, input.dataset.studioPath, value);
	if (
		[
			"commentConfig.type",
			"musicPlayerConfig.mode",
			"backgroundWallpaper.mode",
		].includes(input.dataset.studioPath)
	) {
		renderActiveForm();
		return;
	}
	syncControls(input.dataset.studioPath, value, input);
}

function syncControls(path, value, source) {
	active.container.querySelectorAll("[data-studio-path]").forEach((input) => {
		if (input === source || input.dataset.studioPath !== path) return;
		if (input.type === "checkbox") input.checked = Boolean(value);
		else if (input.type === "radio")
			input.checked = String(input.value) === String(value);
		else input.value = String(value);
	});
	active.container
		.querySelectorAll("[data-studio-swatch]")
		.forEach((swatch) => {
			if (swatch.dataset.studioSwatch === path)
				swatch.style.background = `hsl(${Number(value)} 70% 50%)`;
		});
}

function handleFormAction(event) {
	const button = event.target.closest("[data-studio-action]");
	if (!button || !active?.container.contains(button)) return;
	const path = button.dataset.studioArrayPath;
	const items = getByPath(active.values, path);
	if (!Array.isArray(items)) return;
	const index = Number(button.dataset.studioIndex);
	if (button.dataset.studioAction === "add")
		items.push(getStudioArrayTemplate(path, items));
	if (button.dataset.studioAction === "remove" && Number.isInteger(index))
		items.splice(index, 1);
	if (button.dataset.studioAction === "up" && index > 0)
		[items[index - 1], items[index]] = [items[index], items[index - 1]];
	if (button.dataset.studioAction === "down" && index < items.length - 1)
		[items[index + 1], items[index]] = [items[index], items[index + 1]];
	renderActiveForm();
}

function getByPath(target, path) {
	return String(path)
		.split(".")
		.reduce((value, key) => value?.[key], target);
}

function setByPath(target, path, value) {
	const parts = String(path).split(".");
	let cursor = target;
	for (let index = 0; index < parts.length - 1; index += 1) {
		const key = parts[index];
		if (cursor[key] == null)
			cursor[key] = /^\d+$/.test(parts[index + 1]) ? [] : {};
		cursor = cursor[key];
	}
	cursor[parts.at(-1)] = value;
}

function fieldId(path) {
	return `studio-${String(path).replace(/[^A-Za-z0-9_-]+/g, "-")}`;
}

function normalizeCollectedValue(value) {
	if (Array.isArray(value)) {
		const normalized = value.map((item) => normalizeCollectedValue(item));
		if (normalized.every((item) => typeof item !== "object" || item === null)) {
			return normalized
				.map((item) => (typeof item === "string" ? item.trim() : item))
				.filter((item) => item !== "");
		}
		return normalized;
	}
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [
				key,
				normalizeCollectedValue(item),
			]),
		);
	}
	return value;
}
