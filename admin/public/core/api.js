export async function api(path, options = {}) {
	const response = await fetch(path, {
		headers: { "Content-Type": "application/json", ...(options.headers || {}) },
		...options,
	});
	const payload = await response
		.json()
		.catch(() => ({ ok: false, error: { message: "服务器返回了无效响应。" } }));
	if (!response.ok || !payload.ok) {
		const error = new Error(payload.error?.message || "操作失败，请稍后重试。");
		error.code = payload.error?.code;
		error.details = payload.error?.details;
		error.status = response.status;
		throw error;
	}
	return payload.data;
}
