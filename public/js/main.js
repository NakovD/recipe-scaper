import { fetchRecipes } from "./api.js";
import { setupAutocomplete } from "./autocomplete.js";
import { renderCategoryFilters } from "./categoryFilter.js";
import { renderPagination } from "./pagination.js";
import { renderRecipeList } from "./render.js";

const LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

const resultsEl = document.getElementById("results");
const paginationEl = document.getElementById("pagination");
const searchInput = document.getElementById("search-input");
const autocompleteEl = document.getElementById("autocomplete");
const categoryFiltersEl = document.getElementById("category-filters");

let currentQuery = "";
const activeCategories = new Set();
let searchDebounceTimer;

const loadPage = async (page) => {
	const data = await fetchRecipes(page, LIMIT, currentQuery, [
		...activeCategories,
	]);
	renderRecipeList(resultsEl, data.items);
	renderPagination(paginationEl, data.page, data.totalPages, loadPage);
};

const toggleCategory = (category) => {
	if (activeCategories.has(category)) {
		activeCategories.delete(category);
	} else {
		activeCategories.add(category);
	}
	renderCategoryFilters(categoryFiltersEl, activeCategories, toggleCategory);
	loadPage(1);
};

searchInput.addEventListener("input", () => {
	clearTimeout(searchDebounceTimer);
	searchDebounceTimer = setTimeout(() => {
		currentQuery = searchInput.value.trim();
		loadPage(1);
	}, SEARCH_DEBOUNCE_MS);
});

setupAutocomplete(searchInput, autocompleteEl);
renderCategoryFilters(categoryFiltersEl, activeCategories, toggleCategory);

loadPage(1);
