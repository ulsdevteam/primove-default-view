var pittJS = function() {
	var app;
	var images = [];
f
	function addGoogleAnalytics() {
		app.component('prmTopBarBefore', {
			template: `
				<!-- Global site tag (gtag.js) - Google Analytics -->
				<script async src="https://www.googletagmanager.com/gtag/js?id=UA-129368242-1"></script>
			`
		});
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());

		gtag('config', 'UA-129368242-1');
	}

	/*
	 *  Removes the target attribute from the new search link.
	 *  Will also reset the aria label to be correct (if it's in English)
	 */
	function newSearchSameTab() {
		var newSearchLink = document.querySelector('[data-main-menu-item="NewSearch"] a');
		newSearchLink.removeAttribute("target");

		if(newSearchLink.getAttribute("aria-label") == "New Search, opens in a new window") {
			newSearchLink.setAttribute("aria-label", "New Search");
		}
	}

	function helloWorld() {
		app.component('prmTopBarBefore', {
			template: `<span style="margin-left: 40%;">Hello World</span>`
		});
	}

	function preload() {
	    for (var i = 0; i < arguments.length; i++) {
	        images[i] = new Image();
	        images[i].src = preload.arguments[i];
	    }
	}

	function privateSetup() {
		app = angular.module('viewCustom', ['angularLoad']);
		console.log("Executing custom JS.");

		//helloWorld();
		angular.element(function () {
    		console.log('page loading completed');
    		addGoogleAnalytics();
			newSearchSameTab();
		});
		
		return;
	}

	return {
		setupConstructor: function() {
			privateSetup();
		}
	}

}

var pittJSInstance = pittJS();
pittJSInstance.setupConstructor();