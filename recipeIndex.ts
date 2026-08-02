import * as fs from "node:fs";
import * as path from "node:path";
import { baseDir } from "./appPaths.js";
import { parseRecipeFile } from "./recipeParser.js";
import type { Recipe } from "./recipeTypes.js";

const OUTPUT_DIR = path.join(baseDir, "recipes");

const listPageDirs = (): number[] =>
	fs
		.readdirSync(OUTPUT_DIR, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => Number(entry.name))
		.filter((n) => !Number.isNaN(n))
		.sort((a, b) => a - b);

export const buildRecipeIndex = (): Recipe[] => {
	const recipes: Recipe[] = [];
	if (!fs.existsSync(OUTPUT_DIR)) return recipes;

	for (const pageDir of listPageDirs()) {
		const dirPath = path.join(OUTPUT_DIR, String(pageDir));
		const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".html"));

		for (const file of files) {
			const recipe = parseRecipeFile(path.join(dirPath, file), pageDir);
			if (recipe) recipes.push(recipe);
		}
	}

	recipes.sort((a, b) => a.title.localeCompare(b.title, "bg"));
	return recipes;
};
