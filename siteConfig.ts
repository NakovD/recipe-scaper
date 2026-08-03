try {
	process.loadEnvFile(".env");
} catch {
	// .env is optional if the vars are already set another way (e.g. CI).
}

const domain = process.env["RECIPE_SITE_DOMAIN"];
if (!domain) {
	throw new Error(
		"RECIPE_SITE_DOMAIN is not set. Copy .env.example to .env and fill in the real domain.",
	);
}

export const BASE_URL = `https://${domain}`;
