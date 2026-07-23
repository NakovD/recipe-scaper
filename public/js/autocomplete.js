import { fetchAutocomplete } from "./api.js";
import { escapeHtml } from "./escapeHtml.js";

const DEBOUNCE_MS = 250;

const renderSuggestions = (container, suggestions) => {
	container.innerHTML = suggestions
		.map(
			(item) =>
				`<a href="/recipes/${item.htmlFile}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a>`,
		)
		.join("");
	container.hidden = suggestions.length === 0;
};

export const setupAutocomplete = (input, container) => {
	let debounceTimer;

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
		if (event.target !== input && !container.contains(event.target)) {
			container.hidden = true;
		}
	});
};
