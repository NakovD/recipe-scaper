import * as fs from "fs";
import * as path from "path";
import { chromium } from "playwright";

const BASE_URL = "https://brutalnovkusno.bg";
const RECIPES_LIST_URL = `${BASE_URL}/brutalni-recepti`;
const OUTPUT_DIR = "./recipes";
const SETTINGS_DIR = "./settings";
const SETTINGS_PATH = path.join(SETTINGS_DIR, "settings.json");

// Колко страници (списъци с рецепти) да обходи МАКСИМУМ в тази сесия,
// преди автоматично да спре. Ctrl+C по всяко време работи независимо от това.
const MAX_PAGES_PER_SESSION = 3;

interface Settings {
	lastCompletedPage: number; // последната напълно обходена страница от /brutalni-recepti/N/
	collectedLinks: string[]; // всички линкове към рецепти, събрани досега
	savedSlugs: string[]; // slug-ове на вече запазени HTML файлове
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

function saveSettings(settings: Settings): void {
	fs.mkdirSync(SETTINGS_DIR, { recursive: true });
	fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
}

// Случайно забавяне в зададен диапазон (ms), за да не е trafикът равномерен/подозрителен
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
	const collectedSet = new Set<string>(settings.collectedLinks);
	const savedSet = new Set<string>(settings.savedSlugs);

	console.log(
		`Зареден прогрес: страница ${settings.lastCompletedPage} завършена, ${collectedSet.size} линка събрани, ${savedSet.size} рецепти запазени.`,
	);

	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();

	// Логин
	await page.goto(`${BASE_URL}/login`);
	console.log("Логни се ръчно в браузъра и натисни Enter тук...");
	await new Promise((resolve) => process.stdin.once("data", resolve));

	// Позволява чисто спиране с Ctrl+C — пазим текущия settings обект преди изход
	process.on("SIGINT", async () => {
		console.log("\n\nПрекъснато ръчно (Ctrl+C). Запазвам прогреса...");
		saveSettings({
			lastCompletedPage: settings.lastCompletedPage,
			collectedLinks: Array.from(collectedSet),
			savedSlugs: Array.from(savedSet),
		});
		await browser.close();
		process.exit(0);
	});

	// ----- Фаза 1: Събиране на линкове -----
	console.log("\nЗапочвам събиране на линкове...");

	let currentPage = settings.lastCompletedPage + 1;
	let pagesVisitedThisSession = 0;

	while (pagesVisitedThisSession < MAX_PAGES_PER_SESSION) {
		const listUrl = `${RECIPES_LIST_URL}/${currentPage}/`;
		console.log(`Страница ${currentPage}: ${listUrl}`);

		await page.goto(listUrl, { waitUntil: "networkidle" });

		const links: string[] = await page.$$eval(
			".elementor-loop-container h3.elementor-heading-title a[href]",
			(anchors) => anchors.map((a) => (a as HTMLAnchorElement).href),
		);

		const newLinks = links.filter((l) => !collectedSet.has(l));

		if (links.length === 0) {
			console.log("Страницата е празна — достигнахме края на списъка.");
			break;
		}

		newLinks.forEach((l) => {
			collectedSet.add(l);
		});
		console.log(
			`  Намерени: ${newLinks.length} нови (общо: ${collectedSet.size})`,
		);

		settings.lastCompletedPage = currentPage;
		pagesVisitedThisSession++;

		// Запазваме прогреса след всяка страница, за да е safe резюмирането
		saveSettings({
			lastCompletedPage: settings.lastCompletedPage,
			collectedLinks: Array.from(collectedSet),
			savedSlugs: Array.from(savedSet),
		});

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
		`\nЗапочвам запазване на рецепти (общо събрани: ${collectedSet.size})...`,
	);
	const links = Array.from(collectedSet);

	for (let i = 0; i < links.length; i++) {
		const url = links[i];
		if (!url) continue; // За всеки случай, ако има някакви празни стойности
		const slug = slugFromUrl(url);

		if (savedSet.has(slug)) {
			console.log(
				`  [${i + 1}/${links.length}] Пропускам (вече запазена): ${slug}`,
			);
			continue;
		}

		const filePath = path.join(OUTPUT_DIR, `${slug}.html`);

		try {
			await page.goto(url, { waitUntil: "networkidle" });
			const html = await page.content();
			fs.writeFileSync(filePath, html, "utf-8");
			savedSet.add(slug);
			console.log(`  [${i + 1}/${links.length}] ✓ ${slug}`);

			// Запазваме прогреса след всяка рецепта
			saveSettings({
				lastCompletedPage: settings.lastCompletedPage,
				collectedLinks: Array.from(collectedSet),
				savedSlugs: Array.from(savedSet),
			});
		} catch (err) {
			console.error(`  [${i + 1}/${links.length}] ✗ Грешка при ${url}:`, err);
		}

		await randomDelay(2000, 6000);
	}

	await browser.close();
	console.log("\nГотово! Рецептите са в папка ./recipes");
}

main();
