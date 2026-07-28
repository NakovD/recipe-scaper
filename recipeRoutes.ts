import type { FastifyInstance } from "fastify";
import { createRecipeSearch } from "./recipeSearch.js";
import type { Recipe } from "./recipeTypes.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const AUTOCOMPLETE_LIMIT = 8;

const paginate = (items: Recipe[], page: number, limit: number) => {
	const start = (page - 1) * limit;
	return {
		items: items.slice(start, start + limit),
		total: items.length,
		page,
		limit,
		totalPages: Math.ceil(items.length / limit),
	};
};

const parseCategories = (raw: string | undefined): string[] =>
	raw ? raw.split(",").filter(Boolean) : [];

// A recipe must carry every selected category (intersection), not just one of them.
const matchesAllCategories = (recipe: Recipe, categories: string[]): boolean =>
	categories.every((category) => recipe.categories.includes(category));

export const registerRecipeRoutes = (
	app: FastifyInstance,
	recipeIndex: Recipe[],
): void => {
	const search = createRecipeSearch(recipeIndex);

	app.get("/api/recipes", async (request) => {
		const query = request.query as {
			page?: string;
			limit?: string;
			q?: string;
			categories?: string;
		};
		const page = Math.max(1, Number(query.page) || 1);
		const limit = Math.min(
			MAX_LIMIT,
			Math.max(1, Number(query.limit) || DEFAULT_LIMIT),
		);
		const categories = parseCategories(query.categories);

		let results = query.q ? search(query.q) : recipeIndex;
		if (categories.length > 0) {
			results = results.filter((recipe) =>
				matchesAllCategories(recipe, categories),
			);
		}

		return paginate(results, page, limit);
	});

	app.get("/api/recipes/autocomplete", async (request) => {
		const query = request.query as { q?: string };
		if (!query.q) return { items: [] };

		const matches = search(query.q)
			.slice(0, AUTOCOMPLETE_LIMIT)
			.map((recipe) => ({
				slug: recipe.slug,
				title: recipe.title,
				htmlFile: recipe.htmlFile,
			}));
		return { items: matches };
	});
};
