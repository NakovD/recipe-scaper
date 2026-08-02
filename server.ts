import { exec } from "node:child_process";
import * as path from "node:path";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { baseDir } from "./appPaths.js";
import { buildRecipeIndex } from "./recipeIndex.js";
import { registerRecipeRoutes } from "./recipeRoutes.js";

const PORT = 3000;

const main = async (): Promise<void> => {
	const recipeIndex = buildRecipeIndex();
	console.log(`Indexed ${recipeIndex.length} recipes.`);

	const app = Fastify({ logger: true });

	await app.register(fastifyStatic, {
		root: path.join(baseDir, "recipes"),
		prefix: "/recipes/",
	});

	await app.register(fastifyStatic, {
		root: path.join(baseDir, "public"),
		prefix: "/",
		decorateReply: false,
	});

	registerRecipeRoutes(app, recipeIndex);

	app.listen({ port: PORT }, (err) => {
		if (err) {
			app.log.error(err);
			process.exit(1);
		}
		const url = `http://localhost:${PORT}`;
		console.log(`Server listening on ${url}`);

		if (process.platform === "win32") {
			exec(`start "" "${url}"`);
		}
	});
};

main();
