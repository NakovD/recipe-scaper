export const randomDelay = (minMs: number, maxMs: number): Promise<void> => {
	const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export const slugFromUrl = (url: string): string =>
	url.replace(/https?:\/\/[^/]+\//, "").replace(/\//g, "") || "unknown";
