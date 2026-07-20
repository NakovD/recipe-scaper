import * as fs from "node:fs";
import * as path from "node:path";
import type { Recipe } from "./recipeTypes.js";

interface RecipeLdJson {
	"@type": string;
	name?: string;
	image?: string[];
	recipeCategory?: string[];
	recipeIngredient?: string[];
}

const LD_JSON_REGEX =
	/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
const H1_TITLE_REGEX =
	/<h1 class="elementor-heading-title elementor-size-default">([^<]*)<\/h1>/;

const extractRecipeLdJson = (html: string): RecipeLdJson | undefined => {
	for (const match of html.matchAll(LD_JSON_REGEX)) {
		const raw = match[1];
		if (!raw) continue;
		try {
			const parsed = JSON.parse(raw);
			if (parsed?.["@type"] === "Recipe") {
				return parsed as RecipeLdJson;
			}
		} catch {
			// Not valid JSON — skip this script block.
		}
	}
	return undefined;
};

// The site's recipe plugin sometimes exports a quote (") in the title as the
// literal text "u0022" instead of a valid " escape — fix that up here.
const cleanText = (text: string): string => text.replace(/u0022/g, '"');

const extractTitle = (
	html: string,
	ld: RecipeLdJson | undefined,
): string | undefined => {
	if (ld?.name) return cleanText(ld.name);
	// A handful of files have an empty "name" in their JSON-LD — fall back to the h1.
	const h1Match = html.match(H1_TITLE_REGEX);
	return h1Match?.[1] ? cleanText(h1Match[1].trim()) : undefined;
};

export const parseRecipeFile = (
	filePath: string,
	pageDir: number,
): Recipe | undefined => {
	const html = fs.readFileSync(filePath, "utf-8");
	const ld = extractRecipeLdJson(html);
	const title = extractTitle(html, ld);
	if (!title) return undefined;

	const fileName = path.basename(filePath);

	return {
		slug: path.basename(fileName, ".html"),
		title,
		image: ld?.image?.[0],
		categories: (ld?.recipeCategory ?? []).map(cleanText),
		ingredients: (ld?.recipeIngredient ?? []).map(cleanText),
		pageDir,
		htmlFile: `${pageDir}/${fileName}`,
	};
};
