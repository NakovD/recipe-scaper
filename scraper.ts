import { chromium } from "playwright";
import { collectLinks } from "./linkCollector.js";
import { saveRecipes } from "./recipeSaver.js";
import { loadSettings, saveSettings } from "./settingsStore.js";
import { BASE_URL } from "./siteConfig.js";

const main = async (): Promise<void> => {
	const settings = loadSettings();
	const collectedMap = new Map<string, number>(
		settings.collectedLinks.map(({ url, page }) => [url, page]),
	);
	const savedSet = new Set<string>(settings.savedSlugs);
	let lastCompletedPage = settings.lastCompletedPage;

	console.log(
		`Loaded progress: page ${lastCompletedPage} completed, ${collectedMap.size} links collected, ${savedSet.size} recipes saved.`,
	);

	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();

	await page.goto(`${BASE_URL}/login`);
	console.log("Log in manually in the browser, then press Enter here...");
	await new Promise((resolve) => process.stdin.once("data", resolve));

	process.on("SIGINT", async () => {
		console.log("\n\nInterrupted manually (Ctrl+C). Saving progress...");
		saveSettings(lastCompletedPage, collectedMap, savedSet);
		await browser.close();
		process.exit(0);
	});

	console.log("\nStarting link collection...");
	lastCompletedPage = await collectLinks(
		page,
		collectedMap,
		lastCompletedPage,
		(completedPage) => saveSettings(completedPage, collectedMap, savedSet),
	);

	await saveRecipes(page, collectedMap, savedSet, () =>
		saveSettings(lastCompletedPage, collectedMap, savedSet),
	);

	await browser.close();
};

main();
