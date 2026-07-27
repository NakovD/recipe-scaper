export const FILTER_CATEGORIES = [
	"Рецепти с месо",
	"Рецепти без месо",
	"Сладки рецепти",
	"Солени рецепти",
];

export const renderCategoryFilters = (
	container: HTMLElement,
	activeCategories: Set<string>,
	onToggle: (category: string) => void,
): void => {
	container.innerHTML = "";

	for (const category of FILTER_CATEGORIES) {
		const button = document.createElement("button");
		button.type = "button";
		button.textContent = category;
		button.classList.add("chip");
		if (activeCategories.has(category)) button.classList.add("active");
		button.addEventListener("click", () => onToggle(category));
		container.appendChild(button);
	}
};
