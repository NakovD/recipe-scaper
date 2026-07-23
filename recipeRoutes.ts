import type { FastifyInstance } from "fastify";
import { createRecipeSearch } from "./recipeSearch.js";
import type { Recipe } from "./recipeTypes.js";

const DEFAULT_LIMIT = 20;
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
		};
		const page = Math.max(1, Number(query.page) || 1);
		const limit = Math.max(1, Number(query.limit) || DEFAULT_LIMIT);
		const results = query.q ? search(query.q) : recipeIndex;
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
