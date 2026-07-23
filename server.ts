import * as path from "node:path";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { buildRecipeIndex } from "./recipeIndex.js";
import { registerRecipeRoutes } from "./recipeRoutes.js";

const PORT = 3000;

const recipeIndex = buildRecipeIndex();
console.log(`Indexed ${recipeIndex.length} recipes.`);

const app = Fastify({ logger: true });

await app.register(fastifyStatic, {
	root: path.resolve("./recipes"),
	prefix: "/recipes/",
});

await app.register(fastifyStatic, {
	root: path.resolve("./public"),
	prefix: "/",
	decorateReply: false,
});

registerRecipeRoutes(app, recipeIndex);

app.listen({ port: PORT }, (err) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
	console.log(`Server listening on http://localhost:${PORT}`);
});
