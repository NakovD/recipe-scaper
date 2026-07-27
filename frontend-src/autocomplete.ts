import { fetchAutocomplete } from "./api.js";
import { escapeHtml } from "./escapeHtml.js";
import type { AutocompleteItem } from "./types.js";

const DEBOUNCE_MS = 250;

const renderSuggestions = (
	container: HTMLElement,
	suggestions: AutocompleteItem[],
): void => {
	container.innerHTML = suggestions
		.map(
			(item) =>
				`<a href="/recipes/${item.htmlFile}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a>`,
		)
		.join("");
	container.hidden = suggestions.length === 0;
};

export const setupAutocomplete = (
	input: HTMLInputElement,
	container: HTMLElement,
): void => {
	let debounceTimer: ReturnType<typeof setTimeout>;

	input.addEventListener("input", () => {
		clearTimeout(debounceTimer);
		const query = input.value.trim();

		if (!query) {
			container.hidden = true;
			return;
		}

		debounceTimer = setTimeout(async () => {
			const { items } = await fetchAutocomplete(query);
			renderSuggestions(container, items);
		}, DEBOUNCE_MS);
	});

	// Close on an outside click, but a click on a suggestion (which opens in a
	// new tab) should leave the dropdown open in this tab.
	document.addEventListener("click", (event) => {
		if (event.target !== input && !container.contains(event.target as Node)) {
			container.hidden = true;
		}
	});
};
