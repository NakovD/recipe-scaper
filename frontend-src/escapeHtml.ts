const ESCAPE_MAP: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

export const escapeHtml = (text: string): string =>
	text.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char] ?? char);
