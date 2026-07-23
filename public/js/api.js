const API_BASE = "/api/recipes";

export const fetchRecipes = async (page, limit, query) => {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	if (query) params.set("q", query);

	const response = await fetch(`${API_BASE}?${params}`);
	return response.json();
};

export const fetchAutocomplete = async (query) => {
	const params = new URLSearchParams({ q: query });
	const response = await fetch(`${API_BASE}/autocomplete?${params}`);
	return response.json();
};
