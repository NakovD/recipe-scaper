export interface Recipe {
	slug: string;
	title: string;
	image: string | undefined;
	categories: string[];
	ingredients: string[];
	pageDir: number;
	htmlFile: string;
}

export interface RecipeListResponse {
	items: Recipe[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface AutocompleteItem {
	slug: string;
	title: string;
	htmlFile: string;
}

export interface AutocompleteResponse {
	items: AutocompleteItem[];
}
