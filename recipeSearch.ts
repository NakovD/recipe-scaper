import Fuse from "fuse.js";
import type { Recipe } from "./recipeTypes.js";

// Moderate fuzzy tolerance: forgives a small typo without matching unrelated words.
// Values above ~0.25 started matching completely unrelated recipes in testing.
const FUZZY_THRESHOLD = 0.2;

export const createRecipeSearch = (recipes: Recipe[]) => {
	const fuse = new Fuse(recipes, {
		keys: [
			{ name: "title", weight: 0.7 },
			{ name: "ingredients", weight: 0.3 },
		],
		threshold: FUZZY_THRESHOLD,
		ignoreLocation: true,
		minMatchCharLength: 3,
	});

	return (query: string): Recipe[] =>
		fuse.search(query).map((result) => result.item);
};
