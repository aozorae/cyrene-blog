export class HttpError extends Error {
	constructor(
		public readonly status: number,
		public readonly code: string,
		message: string,
		public readonly details?: unknown,
	) {
		super(message);
		this.name = "HttpError";
	}
}

export function ok<T>(data: T, status = 200): Response {
	return Response.json({ ok: true, data }, { status });
}

export function fail(
	code: string,
	message: string,
	status = 400,
	details?: unknown,
): Response {
	return Response.json({ ok: false, error: { code, message, ...(details === undefined ? {} : { details }) } }, { status });
}

export async function readJson<T>(request: Request, maxBytes = 200_000): Promise<T> {
	const contentType = request.headers.get("content-type") || "";
	if (!contentType.toLowerCase().startsWith("application/json")) {
		throw new HttpError(415, "UNSUPPORTED_MEDIA_TYPE", "请求必须使用 application/json 格式。");
	}
	const contentLength = Number(request.headers.get("content-length") || 0);
	if (contentLength > maxBytes) {
		throw new HttpError(413, "PAYLOAD_TOO_LARGE", "提交内容过大，请拆分后再试。");
	}
	const reader = request.body?.getReader();
	if (!reader) throw new HttpError(400, "EMPTY_BODY", "请求正文不能为空。");
	const chunks: Uint8Array[] = [];
	let size = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > maxBytes) throw new HttpError(413, "PAYLOAD_TOO_LARGE", "提交内容过大，请拆分后再试。");
			chunks.push(value);
		}
		const bytes = new Uint8Array(size);
		let offset = 0;
		for (const chunk of chunks) {
			bytes.set(chunk, offset);
			offset += chunk.byteLength;
		}
		return JSON.parse(new TextDecoder().decode(bytes)) as T;
	} catch (error) {
		if (error instanceof HttpError) throw error;
		throw new HttpError(400, "INVALID_JSON", "请求格式无效，请刷新页面后重试。原因：后台只接受 JSON 表单请求。");
	}
}
