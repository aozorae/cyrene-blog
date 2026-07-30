import { HttpError } from "./response";

const COOKIE_NAME = "__Host-firefly_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function toBase64Url(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
	const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
	const binary = atob(base64);
	return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signingKey(secret: string): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	);
}

async function sign(payload: string, secret: string): Promise<string> {
	const signature = await crypto.subtle.sign(
		"HMAC",
		await signingKey(secret),
		new TextEncoder().encode(payload),
	);
	return toBase64Url(new Uint8Array(signature));
}

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
	try {
		return await crypto.subtle.verify(
			"HMAC",
			await signingKey(secret),
			fromBase64Url(signature),
			new TextEncoder().encode(payload),
		);
	} catch {
		return false;
	}
}

export async function verifyPassword(password: string, expected: string): Promise<boolean> {
	const [actualHash, expectedHash] = await Promise.all([
		crypto.subtle.digest("SHA-256", new TextEncoder().encode(password)),
		crypto.subtle.digest("SHA-256", new TextEncoder().encode(expected)),
	]);
	const actual = new Uint8Array(actualHash);
	const expectedBytes = new Uint8Array(expectedHash);
	if (actual.length !== expectedBytes.length) return false;
	let difference = 0;
	for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expectedBytes[index];
	return difference === 0;
}

export async function createSession(secret: string): Promise<string> {
	const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
	const payload = String(expiresAt);
	const signature = await sign(payload, secret);
	return `${payload}.${signature}`;
}

export async function hasValidSession(request: Request, secret: string): Promise<boolean> {
	const cookieHeader = request.headers.get("cookie") || "";
	const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
	if (!cookie) return false;
	const value = cookie.slice(COOKIE_NAME.length + 1);
	const [expiresAt, signature] = value.split(".");
	if (!expiresAt || !signature || !/^\d{10}$/.test(expiresAt)) return false;
	const expiry = Number(expiresAt);
	const now = Math.floor(Date.now() / 1000);
	if (expiry < now || expiry > now + SESSION_TTL_SECONDS + 60) return false;
	return verifySignature(expiresAt, signature, secret);
}

export function sessionCookie(value: string): string {
	return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie(): string {
	return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function assertSameOrigin(request: Request): void {
	const origin = request.headers.get("origin");
	const expected = new URL(request.url).origin;
	const referer = request.headers.get("referer");
	let refererOrigin = "";
	try {
		refererOrigin = referer ? new URL(referer).origin : "";
	} catch {
		throw new HttpError(403, "ORIGIN_REJECTED", "请求来源格式无效。");
	}
	if ((origin || refererOrigin) !== expected) {
		throw new HttpError(403, "ORIGIN_REJECTED", "请求来源未被允许。原因：后台只接受同站操作，避免跨站提交配置。");
	}
}
