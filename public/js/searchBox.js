const SEARCH_DEBOUNCE_MS = 300;

export const clearSearchInput = (input, clearButton, autocompleteEl) => {
	input.value = "";
	clearButton.hidden = true;
	autocompleteEl.hidden = true;
};

export const setupSearchBox = (
	input,
	clearButton,
	autocompleteEl,
	onQueryChange,
) => {
	let debounceTimer;

	input.addEventListener("input", () => {
		clearButton.hidden = input.value.length === 0;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(
			() => onQueryChange(input.value.trim()),
			SEARCH_DEBOUNCE_MS,
		);
	});

	clearButton.addEventListener("click", () => {
		clearSearchInput(input, clearButton, autocompleteEl);
		onQueryChange("");
		input.focus();
	});
};
