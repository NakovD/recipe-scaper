import type { Page } from "playwright";
import { randomDelay } from "./scraperUtils.js";
import { BASE_URL } from "./siteConfig.js";

const RECIPES_LIST_URL = `${BASE_URL}/brutalni-recepti`;
const MAX_PAGES_PER_SESSION = 3;
const RECIPE_LINK_SELECTOR =
	".elementor-loop-container h3.elementor-heading-title a[href]";

export const collectLinks = async (
	page: Page,
	collectedMap: Map<string, number>,
	lastCompletedPage: number,
	onProgress: (lastCompletedPage: number) => void,
): Promise<number> => {
	let currentPage = lastCompletedPage + 1;
	let pagesVisited = 0;

	while (pagesVisited < MAX_PAGES_PER_SESSION) {
		const listUrl = `${RECIPES_LIST_URL}/${currentPage}/`;
		console.log(`Page ${currentPage}: ${listUrl}`);

		await page.goto(listUrl, { waitUntil: "networkidle" });
		const links = await page.$$eval(RECIPE_LINK_SELECTOR, (anchors) =>
			anchors.map((a) => (a as HTMLAnchorElement).href),
		);

		if (links.length === 0) {
			console.log("Empty page — reached the end of the list.");
			break;
		}

		const newLinks = links.filter((url) => !collectedMap.has(url));
		for (const url of newLinks) collectedMap.set(url, currentPage);
		console.log(
			`  Found: ${newLinks.length} new (total: ${collectedMap.size})`,
		);

		lastCompletedPage = currentPage;
		pagesVisited++;
		onProgress(lastCompletedPage);

		currentPage++;
		await randomDelay(2000, 6000);
	}

	if (pagesVisited >= MAX_PAGES_PER_SESSION) {
		console.log(
			`\nReached the ${MAX_PAGES_PER_SESSION}-page limit for this session.`,
		);
	}

	return lastCompletedPage;
};
