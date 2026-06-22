import * as fs from "fs";
import * as path from "path";
import { chromium } from "playwright";

const BASE_URL = "https://brutalnovkusno.bg";
const RECIPES_LIST_URL = `${BASE_URL}/brutalni-recepti`;
const OUTPUT_DIR = "./recipes";
const SETTINGS_DIR = "./settings";
const SETTINGS_PATH = path.join(SETTINGS_DIR, "settings.json");

const MAX_PAGES_PER_SESSION = 3;

interface CollectedLink {
	url: string;
	page: number;
}

interface Settings {
	lastCompletedPage: number;
	collectedLinks: CollectedLink[];
	savedSlugs: string[];
}

function loadSettings(): Settings {
	if (fs.existsSync(SETTINGS_PATH)) {
		const raw = fs.readFileSync(SETTINGS_PATH, "utf-8");
		return JSON.parse(raw) as Settings;
	}
	return {
		lastCompletedPage: 0,
		collectedLinks: [],
		savedSlugs: [],
	};
}

function saveSettings(
	lastCompletedPage: number,
	collectedMap: Map<string, number>,
	savedSet: Set<string>,
): void {
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
}

function randomDelay(minMs: number, maxMs: number): Promise<void> {
	const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugFromUrl(url: string): string {
	return url.replace(/https?:\/\/[^/]+\//, "").replace(/\//g, "") || "unknown";
}

async function main(): Promise<void> {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	const settings = loadSettings();

	// url → page номер
	const collectedMap = new Map<string, number>(
		settings.collectedLinks.map(({ url, page }) => [url, page]),
	);
	const savedSet = new Set<string>(settings.savedSlugs);
	let lastCompletedPage = settings.lastCompletedPage;

	console.log(
		`Зареден прогрес: страница ${lastCompletedPage} завършена, ${collectedMap.size} линка събрани, ${savedSet.size} рецепти запазени.`,
	);

	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();

	// Логин
	await page.goto(`${BASE_URL}/login`);
	console.log("Логни се ръчно в браузъра и натисни Enter тук...");
	await new Promise((resolve) => process.stdin.once("data", resolve));

	process.on("SIGINT", async () => {
		console.log("\n\nПрекъснато ръчно (Ctrl+C). Запазвам прогреса...");
		saveSettings(lastCompletedPage, collectedMap, savedSet);
		await browser.close();
		process.exit(0);
	});

	// ----- Фаза 1: Събиране на линкове -----
	console.log("\nЗапочвам събиране на линкове...");

	let currentPage = lastCompletedPage + 1;
	let pagesVisitedThisSession = 0;

	while (pagesVisitedThisSession < MAX_PAGES_PER_SESSION) {
		const listUrl = `${RECIPES_LIST_URL}/${currentPage}/`;
		console.log(`Страница ${currentPage}: ${listUrl}`);

		await page.goto(listUrl, { waitUntil: "networkidle" });

		const links: string[] = await page.$$eval(
			".elementor-loop-container h3.elementor-heading-title a[href]",
			(anchors) => anchors.map((a) => (a as HTMLAnchorElement).href),
		);

		if (links.length === 0) {
			console.log("Страницата е празна — достигнахме края на списъка.");
			break;
		}

		const newLinks = links.filter((url) => !collectedMap.has(url));
		newLinks.forEach((url) => {
			collectedMap.set(url, currentPage);
		});
		console.log(
			`  Намерени: ${newLinks.length} нови (общо: ${collectedMap.size})`,
		);

		lastCompletedPage = currentPage;
		pagesVisitedThisSession++;

		saveSettings(lastCompletedPage, collectedMap, savedSet);

		currentPage++;
		await randomDelay(2000, 6000);
	}

	if (pagesVisitedThisSession >= MAX_PAGES_PER_SESSION) {
		console.log(
			`\nДостигнат лимит от ${MAX_PAGES_PER_SESSION} страници за тази сесия.`,
		);
	}

	// ----- Фаза 2: Запазване на рецепти -----
	console.log(
		`\nЗапочвам запазване на рецепти (общо събрани: ${collectedMap.size})...`,
	);
	const allLinks = Array.from(collectedMap.entries());

	for (let i = 0; i < allLinks.length; i++) {
		const data = allLinks.at(i);
		if (!data) continue;
		const [url, pageNum] = data;
		if (!url || !pageNum) continue;
		const slug = slugFromUrl(url);

		if (savedSet.has(slug)) {
			console.log(
				`  [${i + 1}/${allLinks.length}] Пропускам (вече запазена): ${slug}`,
			);
			continue;
		}

		// Създаваме подпапка /recipes/1/, /recipes/2/ и т.н.
		const pageDir = path.join(OUTPUT_DIR, String(pageNum));
		fs.mkdirSync(pageDir, { recursive: true });
		const filePath = path.join(pageDir, `${slug}.html`);

		try {
			await page.goto(url, { waitUntil: "networkidle" });
			const html = await page.content();
			fs.writeFileSync(filePath, html, "utf-8");
			savedSet.add(slug);
			console.log(
				`  [${i + 1}/${allLinks.length}] ✓ [страница ${pageNum}] ${slug}`,
			);

			saveSettings(lastCompletedPage, collectedMap, savedSet);
		} catch (err) {
			console.error(
				`  [${i + 1}/${allLinks.length}] ✗ Грешка при ${url}:`,
				err,
			);
		}

		await randomDelay(2000, 6000);
	}

	await browser.close();
	console.log("\nГотово! Рецептите са в папка ./recipes");
}

main();
