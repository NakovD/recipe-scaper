import { exec } from "node:child_process";
import * as path from "node:path";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { baseDir } from "./appPaths.js";
import { registerRecipeRoutes } from "./recipeRoutes.js";
import { loadRecipes } from "./recipeStore.js";

const PORT = 3000;

const loadRecipesInBackground = (): void => {
	console.log("Loading recipes... (the first start can take a few minutes)");
	loadRecipes()
		.then((count) => console.log(`Indexed ${count} recipes.`))
		.catch((err) => {
			console.error("Failed to load recipes:", err);
			process.exit(1);
		});
};

const main = async (): Promise<void> => {
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

	registerRecipeRoutes(app);

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
		loadRecipesInBackground();
	});
};

main();
