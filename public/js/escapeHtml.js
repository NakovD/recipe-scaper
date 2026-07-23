const ESCAPE_MAP = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

export const escapeHtml = (text) =>
	text.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]);
