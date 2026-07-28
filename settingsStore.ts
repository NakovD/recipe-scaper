import * as fs from "node:fs";
import * as path from "node:path";

const SETTINGS_DIR = "./settings";
const SETTINGS_PATH = path.join(SETTINGS_DIR, "settings.json");

interface CollectedLink {
	url: string;
	page: number;
}

export interface Settings {
	lastCompletedPage: number;
	collectedLinks: CollectedLink[];
	savedSlugs: string[];
}

export const loadSettings = (): Settings => {
	if (!fs.existsSync(SETTINGS_PATH)) {
		return { lastCompletedPage: 0, collectedLinks: [], savedSlugs: [] };
	}
	const raw = fs.readFileSync(SETTINGS_PATH, "utf-8");
	return JSON.parse(raw) as Settings;
};

export const saveSettings = (
	lastCompletedPage: number,
	collectedMap: Map<string, number>,
	savedSet: Set<string>,
): void => {
	fs.mkdirSync(SETTINGS_DIR, { recursive: true });
	const settings: Settings = {
		lastCompletedPage,
		collectedLinks: Array.from(collectedMap.entries()).map(([url, page]) => ({
			url,
			page,
		})),
		savedSlugs: Array.from(savedSet),
	};
	fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
};
