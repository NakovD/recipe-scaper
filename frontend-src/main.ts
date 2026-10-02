import { fetchRecipes } from "./api.js";
import { setupAutocomplete } from "./autocomplete.js";
import { renderCategoryFilters } from "./categoryFilter.js";
import { renderPagination } from "./pagination.js";
import { renderLoadingState, renderRecipeList } from "./render.js";
import { clearSearchInput, setupSearchBox } from "./searchBox.js";

const LIMIT = 20;
const LOADING_RETRY_MS = 1000;

const resultsEl = document.getElementById("results") as HTMLElement;
const paginationEl = document.getElementById("pagination") as HTMLElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const clearSearchBtn = document.getElementById("clear-search") as HTMLElement;
const autocompleteEl = document.getElementById("autocomplete") as HTMLElement;
const categoryFiltersEl = document.getElementById(
	"category-filters",
) as HTMLElement;
const resetAllBtn = document.getElementById("reset-all") as HTMLElement;

let currentQuery = "";
let loadingRetryTimer: ReturnType<typeof setTimeout> | undefined;
const activeCategories = new Set<string>();

const loadPage = async (page: number): Promise<void> => {
	const data = await fetchRecipes(page, LIMIT, currentQuery, [
		...activeCategories,
	]);
	if (!data) {
		renderLoadingState(resultsEl);
		// A single pending retry: filter clicks while loading must not pile up timers.
		clearTimeout(loadingRetryTimer);
		loadingRetryTimer = setTimeout(() => loadPage(page), LOADING_RETRY_MS);
		return;
	}
	renderRecipeList(resultsEl, data.items);
	renderPagination(paginationEl, data.page, data.totalPages, loadPage);
};

const toggleCategory = (category: string): void => {
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
