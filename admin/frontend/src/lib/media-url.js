export function getMediaUrl(value) {
	if (!value || typeof value !== "string") {
		return value;
	}

	try {
		const url = new URL(value);
		if (url.pathname.startsWith("/storage/")) {
			return url.pathname;
		}
	} catch {
		if (value.startsWith("/storage/")) {
			return value;
		}
	}

	return value;
}
