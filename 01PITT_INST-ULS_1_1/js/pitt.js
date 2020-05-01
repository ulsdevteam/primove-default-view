var pittJS = function() {
    var app;

	function addGoogleAnalytics() {
		return;
	}

	function helloWorld() {
	    app.component('prmTopBarBefore', {
	        template: `<span style="margin-left: 40%;">Hello World</span>`
	    });
	}

	function private_setup() {
		app = angular.module('viewCustom', ['angularLoad']);
	    console.log("Executing custom JS.");

	    helloWorld();
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