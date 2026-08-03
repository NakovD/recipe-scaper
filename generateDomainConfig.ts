import * as fs from "node:fs";

try {
	process.loadEnvFile(".env");
} catch {
	// .env is optional if the vars are already set another way (e.g. CI).
}

const oldDomain = process.env["RECIPE_SITE_OLD_DOMAIN"];
const newDomain = process.env["RECIPE_SITE_DOMAIN"];

if (!oldDomain || !newDomain) {
	throw new Error(
		"RECIPE_SITE_DOMAIN / RECIPE_SITE_OLD_DOMAIN are not set. Copy .env.example to .env and fill them in.",
	);
}

const content = `export const OLD_DOMAIN = "${oldDomain}";\nexport const NEW_DOMAIN = "${newDomain}";\n`;
fs.writeFileSync("./frontend-src/domainConfig.ts", content, "utf-8");
console.log("Generated frontend-src/domainConfig.ts");
