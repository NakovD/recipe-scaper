const API_BASE = "/api/recipes";

export const fetchRecipes = async (page, limit, query, categories) => {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	if (query) params.set("q", query);
	if (categories && categories.length > 0)
		params.set("categories", categories.join(","));

	const response = await fetch(`${API_BASE}?${params}`);
	return response.json();
};

export const fetchAutocomplete = async (query) => {
	const params = new URLSearchParams({ q: query });
	const response = await fetch(`${API_BASE}/autocomplete?${params}`);
	return response.json();
};
