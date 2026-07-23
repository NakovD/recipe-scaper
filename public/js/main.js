import { fetchRecipes } from "./api.js";
import { setupAutocomplete } from "./autocomplete.js";
import { renderPagination } from "./pagination.js";
import { renderRecipeList } from "./render.js";

const LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

const resultsEl = document.getElementById("results");
const paginationEl = document.getElementById("pagination");
const searchInput = document.getElementById("search-input");
const autocompleteEl = document.getElementById("autocomplete");

let currentQuery = "";
let searchDebounceTimer;

const loadPage = async (page) => {
	const data = await fetchRecipes(page, LIMIT, currentQuery);
	renderRecipeList(resultsEl, data.items);
	renderPagination(paginationEl, data.page, data.totalPages, loadPage);
};

searchInput.addEventListener("input", () => {
	clearTimeout(searchDebounceTimer);
	searchDebounceTimer = setTimeout(() => {
		currentQuery = searchInput.value.trim();
		loadPage(1);
	}, SEARCH_DEBOUNCE_MS);
});

setupAutocomplete(searchInput, autocompleteEl);

loadPage(1);
