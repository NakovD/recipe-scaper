const PAGE_WINDOW = 2;

const buildPageNumbers = (page, totalPages) => {
	const start = Math.max(1, page - PAGE_WINDOW);
	const end = Math.min(totalPages, page + PAGE_WINDOW);
	const pages = [];
	for (let i = start; i <= end; i++) pages.push(i);
	return pages;
};

export const renderPagination = (container, page, totalPages, onPageChange) => {
	container.innerHTML = "";
	if (totalPages <= 1) return;

	const addButton = (label, targetPage, disabled, active) => {
		const button = document.createElement("button");
		button.textContent = label;
		button.disabled = disabled;
		if (active) button.classList.add("active");
		button.addEventListener("click", () => onPageChange(targetPage));
		container.appendChild(button);
	};

	addButton("«", page - 1, page === 1, false);
	for (const p of buildPageNumbers(page, totalPages)) {
		addButton(String(p), p, false, p === page);
	}
	addButton("»", page + 1, page === totalPages, false);
};
