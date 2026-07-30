function revisionAt(revision, path, fallback) {
	return revision && Object.hasOwn(revision, path) ? revision[path] : fallback;
}

export function articleBaseRevision(current, originalPath, originalSha, targetPath) {
	if (!originalPath) {
		return { [targetPath]: revisionAt(current, targetPath, null) };
	}
	const revision = {
		[originalPath]: revisionAt(current, originalPath, originalSha ?? null),
	};
	if (targetPath !== originalPath) {
		revision[targetPath] = revisionAt(current, targetPath, null);
	}
	return revision;
}

export function targetBaseRevision(current, targetPath) {
	return { [targetPath]: revisionAt(current, targetPath, null) };
}
