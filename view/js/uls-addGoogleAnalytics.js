import { loadScript } from './uls-loadScript.js';

function addGoogleAnalytics() {
	loadScript("https://www.googletagmanager.com/gtag/js?id=UA-129368242-1", false, false);

	// set up current window; this should be empty
	window.uls.currentLocation = "";
	window.uls.currentTitle = "";

	window.dataLayer = window.dataLayer || [];

	function gtag() {
		dataLayer.push(arguments);
	}

	function googleAnalyticsPageviewMonitor() {
		if((window.uls.currentLocation != window.location.href) && (window.uls.currentTitle != document.title)) {
			// if we have a difference and we also have a title
			// (these two conditions could be split, but it's simpler to join them)

			window.uls.currentLocation = window.location.href; // update our current location so we stop triggering further checks
			window.uls.currentTitle = document.title; // update our current title so we can accurately detect when a new title has loaded
			googleAnalyticsPageviewRequest(); // make a GA pageview request
		}
		// always run the settimeout
		window.setTimeout(googleAnalyticsPageviewMonitor, 100);
	}

	function googleAnalyticsPageviewRequest() {
		gtag('config', 'UA-129368242-1', {'page_title' : document.title, 'page_location' : window.location.href});
		console.log("GA pageview request: page title = \""+document.title+"\" / page location = \""+window.location.href+"\"");
	}

	gtag('js', new Date());
	googleAnalyticsPageviewMonitor();
}

export { addGoogleAnalytics }