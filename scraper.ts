import * as fs from "fs";
import * as path from "path";
import { chromium } from "playwright";

const BASE_URL = "https://brutalnovkusno.bg";
const RECIPES_LIST_URL = `${BASE_URL}/brutalni-recepti`;
const OUTPUT_DIR = "./recipes";

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugFromUrl(url: string): string {
	return url.replace(/https?:\/\/[^/]+\//, "").replace(/\//g, "") || "unknown";
}

async function main(): Promise<void> {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();

	// Логин
	await page.goto(`${BASE_URL}/login`);
	console.log("Логни се ръчно в браузъра и натисни Enter тук...");
	await new Promise((resolve) => process.stdin.once("data", resolve));

	// Събиране на всички линкове
	const allRecipeLinks = new Set<string>();
	let currentPage = 1;

	console.log("\nЗапочвам събиране на линкове...");

	while (true) {
		const listUrl = `${RECIPES_LIST_URL}/${currentPage}/`;
		console.log(`Страница ${currentPage}: ${listUrl}`);

		await page.goto(listUrl, { waitUntil: "networkidle" });

		const links: string[] = await page.$$eval(
			".elementor-loop-container h3.elementor-heading-title a[href]",
			(anchors) => anchors.map((a) => (a as HTMLAnchorElement).href),
		);

		const newLinks = links.filter((l) => !allRecipeLinks.has(l));

		if (newLinks.length === 0) {
			console.log("Няма нови линкове — край на списъка.");
			break;
		}

		newLinks.forEach((l) => {
			allRecipeLinks.add(l);
		});
		console.log(
			`  Намерени: ${newLinks.length} нови (общо: ${allRecipeLinks.size})`,
		);
		if (currentPage === 1) {
			break;
		}
		currentPage++;
		await sleep(1000);
	}

	// Запазване на всяка рецепта
	console.log(`\nЗапочвам запазване на ${allRecipeLinks.size} рецепти...`);
	const links = Array.from(allRecipeLinks);

	for (let i = 0; i < links.length; i++) {
		const url = links[i];
		if (!url) continue;
		const slug = slugFromUrl(url);
		const filePath = path.join(OUTPUT_DIR, `${slug}.html`);

		// Пропусни ако вече е запазена
		if (fs.existsSync(filePath)) {
			console.log(
				`  [${i + 1}/${links.length}] Пропускам (вече съществува): ${slug}`,
			);
			continue;
		}

		try {
			await page.goto(url, { waitUntil: "networkidle" });
			const html = await page.content();
			fs.writeFileSync(filePath, html, "utf-8");
			console.log(`  [${i + 1}/${links.length}] ✓ ${slug}`);
			break;
		} catch (err) {
			console.error(`  [${i + 1}/${links.length}] ✗ Грешка при ${url}:`, err);
		}

		await sleep(1000);
	}

	await browser.close();
	console.log("\nГотово! Рецептите са в папка ./recipes");
}

main();
