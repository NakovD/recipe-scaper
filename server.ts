import * as path from "node:path";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { buildRecipeIndex } from "./recipeIndex.js";
import type { Recipe } from "./recipeTypes.js";

const PORT = 3000;
const DEFAULT_LIMIT = 20;

const recipeIndex: Recipe[] = buildRecipeIndex();
console.log(`Indexed ${recipeIndex.length} recipes.`);

const app = Fastify({ logger: true });

await app.register(fastifyStatic, {
	root: path.resolve("./recipes"),
	prefix: "/recipes/",
});

app.get("/api/recipes", async (request) => {
	const query = request.query as { page?: string; limit?: string };

	const page = Math.max(1, Number(query.page) || 1);
	const limit = Math.max(1, Number(query.limit) || DEFAULT_LIMIT);
	const start = (page - 1) * limit;

	return {
		items: recipeIndex.slice(start, start + limit),
		total: recipeIndex.length,
		page,
		limit,
		totalPages: Math.ceil(recipeIndex.length / limit),
	};
});

app.listen({ port: PORT }, (err) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
	console.log(`Server listening on http://localhost:${PORT}`);
});
