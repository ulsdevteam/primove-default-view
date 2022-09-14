// Import statements are always in the topmost level of a module, and regardless of line order are always executed first.
// So why not just put them here to reduce confusion?
import { newSearchSameTab } from "./uls-newSearchSameTab.js";
import { chatWidget } from "./uls-libAnswersChatWidget.js";
import { addGoogleAnalytics } from "./uls-addGoogleAnalytics.js";

(function () {
	"use strict";
	'use strict';

	var pittJS = function pittJS() {
		var images = [];

		function preload() {
			for (var i = 0; i < arguments.length; i++) {
				images[i] = new Image();
				images[i].src = preload.arguments[i];
			}
		}

		function privateSetup() {
			console.log("Executing custom JS.");

			angular.element(function () {
				console.log('page loading completed');
//				addGoogleAnalytics();
				chatWidget();
				newSearchSameTab();
			});

			return;
		}

		return {
			setupConstructor: function setupConstructor() {
				privateSetup();
			}
		};
	};

	var pittJSInstance = pittJS();
	pittJSInstance.setupConstructor();
})();