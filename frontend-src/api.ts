import type { AutocompleteResponse, RecipeListResponse } from "./types.js";

const API_BASE = "/api/recipes";

// The server answers 503 while it is still loading recipes in the background.
const RECIPES_LOADING_STATUS = 503;

// Resolves to undefined while the server is still loading recipes.
export const fetchRecipes = async (
	page: number,
	limit: number,
	query: string,
	categories: string[],
): Promise<RecipeListResponse | undefined> => {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	if (query) params.set("q", query);
	if (categories.length > 0) params.set("categories", categories.join(","));

	const response = await fetch(`${API_BASE}?${params}`);
	if (response.status === RECIPES_LOADING_STATUS) return undefined;
	return response.json();
};

export const fetchAutocomplete = async (
	query: string,
): Promise<AutocompleteResponse> => {
	const params = new URLSearchParams({ q: query });
	const response = await fetch(`${API_BASE}/autocomplete?${params}`);
	if (response.status === RECIPES_LOADING_STATUS) return { items: [] };
	return response.json();
};
