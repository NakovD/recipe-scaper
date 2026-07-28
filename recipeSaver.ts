import * as fs from "node:fs";
import * as path from "node:path";
import type { Page } from "playwright";
import { randomDelay, slugFromUrl } from "./scraperUtils.js";

const OUTPUT_DIR = "./recipes";

export const saveRecipes = async (
	page: Page,
	collectedMap: Map<string, number>,
	savedSet: Set<string>,
	onProgress: () => void,
): Promise<void> => {
	const allLinks = Array.from(collectedMap.entries());
	console.log(`\nSaving recipes (collected so far: ${allLinks.length})...`);

	for (let i = 0; i < allLinks.length; i++) {
		const entry = allLinks.at(i);
		if (!entry) continue;
		const [url, pageNum] = entry;
		const slug = slugFromUrl(url);

		if (savedSet.has(slug)) {
			console.log(
				`  [${i + 1}/${allLinks.length}] Skipping (already saved): ${slug}`,
			);
			continue;
		}

		const pageDir = path.join(OUTPUT_DIR, String(pageNum));
		fs.mkdirSync(pageDir, { recursive: true });
		const filePath = path.join(pageDir, `${slug}.html`);

		try {
			await page.goto(url, { waitUntil: "networkidle" });
			const html = await page.content();
			fs.writeFileSync(filePath, html, "utf-8");
			savedSet.add(slug);
			console.log(
				`  [${i + 1}/${allLinks.length}] OK [page ${pageNum}] ${slug}`,
			);
			onProgress();
		} catch (err) {
			console.error(`  [${i + 1}/${allLinks.length}] FAILED ${url}:`, err);
		}

		await randomDelay(2000, 6000);
	}

	console.log("\nDone! Recipes are in ./recipes");
};
