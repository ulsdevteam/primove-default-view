/*
     * function checkAngularCheckbox(element)
     * function uncheckAngularCheckbox(element)
     * 
     * Check and uncheck a Primo VE style checkbox.
     * 
     * These changes have been reverse-engineered from
     * the existing Angular code and are what happens
     * when Primo itself checks (or unchecks) a
     * checkbox, as far as we can tell.
     */
function checkAngularCheckbox(element) {
    // remove class ng-empty
    element.classList.remove("ng-empty");
    // add class ng-not-empty
    element.classList.add("ng-not-empty");
    // add class md-checked
    element.classList.add("md-checked");
    // change attribute aria-checked : set value to true
    element.setAttribute("aria-checked", true);
}

function uncheckAngularCheckbox(element) {
    // remove class ng-not-empty
    element.classList.remove("ng-not-empty");
    // remove class md-checked
    element.classList.remove("md-checked");
    // add class ng-empty
    element.classList.add("ng-empty");
    // change attribute aria-checked : set value to false
    element.setAttribute("aria-checked", false);
}

/*
 * reShareIntegrationButton
 *
 * We're replacing the Expand to Non-Pitt Results button with our own custom creation
 * that points to the PittCatPlus search scope.
 */
function reShareIntegrationButton() {
    /*
        This should probably be replaced with an implementation using one of the location objects. Whether we
        can do this, and how we implement it, will depend on whether we want to keep supporting IE.
        FIND: (?<=\&tab=)(?<tab>[^&#]+)(?=(?:\&|#|$))				REPLACE: \&tab=LibraryCatalog
        FIND: (?<=\&search_scope=)(?<scope>[^&#]+)(?=(?:\&|#|$))	REPLACE: \&search_scope=
    
        Breaking down the regex:
            (?<=\&tab=)			Positive Lookbehind: we want to "match" on "&tab=", but it's not the part we want to change,
                                    and we don't want to return it as part of the "official" match.
            (?<tab>[^&#]+)		Named capture group: this contains the value in the name-value pair, basically
                                    everything after the equals sign. To grab that, we're doing a match on
                                    everything that's not an ampersand. This will run until it sees another ampersand,
                                    signifying the start of another name/value pair; a hash/pound sign, signifying
                                    the start of an anchor; or the end of the location string.
                                    This will be stored as tab and can be referenced later.
            (?=(?:\&|#|$))		Positive Lookahead (and a non-capturing group): We don't want to include the delimiter
                                    in the match (the &, #, or $) but we want to make sure it's there, so we're running
                                    a positive lookahead to confirm it. Because we have three options (which I've
                                    separated out with pipes rather than a character set) I put those inside parens
                                    to limit possible side-effects. Parens create capture groups so I made this a non-
                                    capturing group just to keep our capture groups clean.
    */
    var tabRegexReplace = new RegExp('(?<=\&tab=)(?<tab>[^&#]+)(?=(?:\&|#|$))')
    var scopeRegexReplace = new RegExp('(?<=\&search_scope=)(?<scope>[^&#]+)(?=(?:\&|#|$))')

    var expandButton = document.querySelector('div.sidebar-section > md-checkbox');
    if (expandButton) {
        // Trying to avoid a race condition with the process that fills buttons with translations
        // Primo seems to build out the DOM, and then iterate through each item and add
        // aria-labels and text content. And we'll join that with the check to see if we haven't
        // already replaced the button.
        if (expandButton.hasAttribute("aria-label") && !expandButton.classList.contains("uls-replaced")) {
            // This replaces the "expand to non-Pitt resources" button with a cloned copy
            // of the button that doesn't have any event handlers associated with it.
            expandButton.parentNode.replaceChild(expandButton.cloneNode(1), expandButton);
            // Turns out if you don't re-select the new clone you keep operating on the original.
            // Which isn't there anymore.
            expandButton = document.querySelector('div.sidebar-section > md-checkbox');
            // Add a flag to the button so we know it's been replaced.
            expandButton.classList.add("uls-replaced");
            console.log("Expand [...] Resources button replaced.");

            // Setup the event listeners
            expandButton.addEventListener("click", function () {
                // Is this already checked? We can look at
                // ng-empty (unchecked) vs. ng-not-empty (checked)
                if (expandButton.classList.contains("ng-empty")) {
                    // checkbox is not yet checked
                    checkAngularCheckbox(this);

                    // Change Scope
                    // Setting window.location changes the angular context doesn't seem to force a full reload, nifty
                    window.location = String(window.location).replace(tabRegexReplace, "WorldCatPlus").replace(scopeRegexReplace, "WORLDCATPLUS");
                } else {
                    // implies that the checkbox is currently checked
                    uncheckAngularCheckbox(this);

                    // Change Scope
                    // Setting window.location changes the angular context doesn't seem to force a full reload, nifty
                    window.location = String(window.location).replace(tabRegexReplace, "Everything").replace(scopeRegexReplace, "MyInst_and_CI");
                }
            });
        }
    }
    /*
        Setting this to just... run, periodically, so we can rebuild this button
        whenever it gets regenerated. It's pretty awful, but it might be our best
        option for now.
    */
    setTimeout(reShareIntegrationButton, 500);
}

/*
 * checkBoxIfInReshareScope
 * 
 * When we manually change scopes, we force a rebuild of the existing checkboxes. (And
 * everything else on the page, almost!) So we need to have something run that is checking
 * to see if the unchecked checkbox pops back up, and if it does, make sure it gets checked!
 */
function checkBoxIfInReshareScope() {
    // Bad bad bad practice! Reused code. Closely related to regular expressions in reShareIntegrationButton().
    var scopeRegexMatch = new RegExp('(?<=\&search_scope=)(?:[^&#]+)(?=(?:\&|#|$))')
    var expandButton = document.querySelector('div.sidebar-section > md-checkbox');
    var primoReShareScope = "WORLDCATPLUS";
    if (expandButton) {
        // Breaking up the if-statements to avoid null references

        // Trying to avoid a race condition with the process that fills buttons with translations
        // Primo seems to build out the DOM, and then iterate through each item and add
        // aria-labels and text content. We're replacing the check of the aria-label attribute with
        // a check of the uls-replaced class to try to limit the possibility of ANOTHER race
        // condition, where we might start cloning the button and then attempt to check the button
        // during the copy. We shouldn't add the uls-replaced class until after the aria-label
        // attribute exists, so we should get a 2-for-1 deal on our validation this way.
        if (expandButton.classList.contains("uls-replaced") && String(window.location).match(scopeRegexMatch) == primoReShareScope && expandButton.classList.contains("ng-empty")) {
            // We're in the ReShare Scope, and the checkbox isn't checked.
            checkAngularCheckbox(expandButton);
        }
    }
    setTimeout(checkBoxIfInReshareScope, 250);
}

export { checkBoxIfInReshareScope, reShareIntegrationButton }