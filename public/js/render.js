import { escapeHtml } from "./escapeHtml.js";
import { handleImageError } from "./imageFallback.js";

const HIDDEN_CATEGORIES = new Set(["Платени рецепти"]);

const renderBadges = (categories) =>
	categories
		.filter((category) => !HIDDEN_CATEGORIES.has(category))
		.map((category) => `<span class="badge">${escapeHtml(category)}</span>`)
		.join("");

const renderImage = (recipe) => {
	if (!recipe.image)
		return `<div class="recipe-image-wrap image-missing"></div>`;

	return `<div class="recipe-image-wrap">
		<img src="${escapeHtml(recipe.image)}" alt="${escapeHtml(recipe.title)}" loading="lazy">
	</div>`;
};

const renderCard = (recipe) => `
	<a class="recipe-card" href="/recipes/${recipe.htmlFile}" target="_blank" rel="noopener noreferrer">
		${renderImage(recipe)}
		<h3>${escapeHtml(recipe.title)}</h3>
		<div class="badges">${renderBadges(recipe.categories)}</div>
	</a>
`;

export const renderRecipeList = (container, recipes) => {
	if (recipes.length === 0) {
		container.innerHTML = `<p class="empty-state">Няма намерени рецепти.</p>`;
		return;
	}

	container.innerHTML = recipes.map(renderCard).join("");
	for (const img of container.querySelectorAll("img")) {
		img.addEventListener("error", handleImageError);
	}
};
