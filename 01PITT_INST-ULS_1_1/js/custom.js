var pittJS = function() {
    var app;

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

	function helloWorld() {
	    app.component('prmTopBarBefore', {
	        template: `<span style="margin-left: 40%;">Hello World</span>`
	    });
	}

	function private_setup() {
		app = angular.module('viewCustom', ['angularLoad']);
	    console.log("Executing custom JS.");

	    //helloWorld();
	    addGoogleAnalytics();
	    
	    return;
	}

	return {
		setupConstructor: function() {
			private_setup();
		}
	}

}

var pittJSInstance = pittJS();
pittJSInstance.setupConstructor();