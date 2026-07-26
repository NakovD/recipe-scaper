import { fetchRecipes } from "./api.js";
import { setupAutocomplete } from "./autocomplete.js";
import { renderCategoryFilters } from "./categoryFilter.js";
import { renderPagination } from "./pagination.js";
import { renderRecipeList } from "./render.js";
import { clearSearchInput, setupSearchBox } from "./searchBox.js";

const LIMIT = 20;

const resultsEl = document.getElementById("results");
const paginationEl = document.getElementById("pagination");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search");
const autocompleteEl = document.getElementById("autocomplete");
const categoryFiltersEl = document.getElementById("category-filters");
const resetAllBtn = document.getElementById("reset-all");

let currentQuery = "";
const activeCategories = new Set();

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

resetAllBtn.addEventListener("click", () => {
	clearSearchInput(searchInput, clearSearchBtn, autocompleteEl);
	currentQuery = "";
	activeCategories.clear();
	renderCategoryFilters(categoryFiltersEl, activeCategories, toggleCategory);
	loadPage(1);
});

setupSearchBox(searchInput, clearSearchBtn, autocompleteEl, (query) => {
	currentQuery = query;
	loadPage(1);
});
setupAutocomplete(searchInput, autocompleteEl);
renderCategoryFilters(categoryFiltersEl, activeCategories, toggleCategory);

loadPage(1);
