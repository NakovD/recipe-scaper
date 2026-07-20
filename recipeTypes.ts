export interface Recipe {
	slug: string;
	title: string;
	image: string | undefined;
	categories: string[];
	ingredients: string[];
	pageDir: number;
	htmlFile: string;
}
