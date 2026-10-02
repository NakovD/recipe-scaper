import { buildRecipeIndex } from "./recipeIndex.js";
import { createRecipeSearch } from "./recipeSearch.js";
import type { Recipe } from "./recipeTypes.js";

interface LoadedRecipes {
	recipeIndex: Recipe[];
	search: (query: string) => Recipe[];
}

// Stays undefined until the background load finishes, so the API can answer
// "still loading" instead of blocking the whole server.
let loaded: LoadedRecipes | undefined;

export const getLoadedRecipes = (): LoadedRecipes | undefined => loaded;

export const loadRecipes = async (): Promise<number> => {
	const recipeIndex = await buildRecipeIndex();
	loaded = { recipeIndex, search: createRecipeSearch(recipeIndex) };
	return recipeIndex.length;
};
