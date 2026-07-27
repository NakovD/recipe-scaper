const OLD_DOMAIN = "brutalnovkusno.com";
const NEW_DOMAIN = "brutalnovkusno.bg";

// The site migrated domains at some point; some saved image URLs still point
// at the old one. Try the new domain once before giving up on the image.
export const handleImageError = (event: Event): void => {
	const img = event.target as HTMLImageElement;
	const wrap = img.closest(".recipe-image-wrap");

	if (img.dataset["domainSwapped"] !== "true" && img.src.includes(OLD_DOMAIN)) {
		img.dataset["domainSwapped"] = "true";
		img.src = img.src.replace(OLD_DOMAIN, NEW_DOMAIN);
		return;
	}

	img.onerror = null;
	wrap?.classList.add("image-missing");
};
