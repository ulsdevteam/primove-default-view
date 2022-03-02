/*
 *  Removes the target attribute from the new search link.
 *  Will also reset the aria label to be correct (if it's in English)
 */
function newSearchSameTab() {
	console.log("Updating New Search tab.");
	var newSearchLink = document.querySelector('[data-main-menu-item="NewSearch"] a');
	if (newSearchLink) {
		newSearchLink.removeAttribute("target");

		if (newSearchLink.getAttribute("aria-label") == "New Search, opens in a new window") {
			newSearchLink.setAttribute("aria-label", "New Search");
		}
	} else {
		// this is terrible and I want to see if it works anyway.
		setTimeout(newSearchSameTab, 500);
	}
}

export { newSearchSameTab }