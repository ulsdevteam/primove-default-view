// Import statements are always in the topmost level of a module, and regardless of line order are always executed first.
// So why not just put them here to reduce confusion?
import { newSearchSameTab } from "./uls-newSearchSameTab.js";
import { chatWidget } from "./uls-libAnswersChatWidget.js";
import { addGoogleAnalytics } from "./uls-addGoogleAnalytics.js";

(function () {
	"use strict";
	'use strict';

	var pittJS = function pittJS() {
		var app;
		var hathi;
		var images = [];

		/*
		 * Adds Hathi Trust availablity links where applicable
		 * Creates placeholder for Third Iron/Browzine content
		 */
		function prmSearchResultAvailabilityLineAfterTemplate() {
			app.component('prmSearchResultAvailabilityLineAfter', {
				//note the ignore-copyright attribute.  Once ETAS ends this will need to be removed.  Entity-id should request SSO login on the way to the Hathi site.
				template: '<hathi-trust-availability hide-online="true" entity-id="https://passport.pitt.edu/idp/shibboleth"></hathi-trust-availability>\
		  <third-iron></third-iron>'
				// Note: Report a Problem links are generated in the thirdIron module to work around their layout requirements
			});
		}

		function thirdIron() {
			window.browzine = {
				api: "https://public-api.thirdiron.com/public/v1/libraries/154",
				apiKey: "6d4e92f4-0a30-40fa-8dcb-5834e03197a0",

				journalCoverImagesEnabled: true,

				journalBrowZineWebLinkTextEnabled: true,
				journalBrowZineWebLinkText: "View Journal Contents",

				articleBrowZineWebLinkTextEnabled: true,
				articleBrowZineWebLinkText: "View Issue Contents",

				articlePDFDownloadLinkEnabled: true,
				articlePDFDownloadLinkText: "Download Article PDF",

				articleLinkEnabled: true,
				articleLinkText: "Read Article",

				printRecordsIntegrationEnabled: true,

				unpaywallEmailAddressKey: "uls-systemsdevelopment@pitt.edu",

				articlePDFDownloadViaUnpaywallEnabled: true,
				articlePDFDownloadViaUnpaywallText: "Download PDF (via Unpaywall)",

				articleLinkViaUnpaywallEnabled: true,
				articleLinkViaUnpaywallText: "Read Article (via Unpaywall)",

				articleAcceptedManuscriptPDFViaUnpaywallEnabled: true,
				articleAcceptedManuscriptPDFViaUnpaywallText: "Download PDF (Accepted Manuscript via Unpaywall)",

				articleAcceptedManuscriptArticleLinkViaUnpaywallEnabled: true,
				articleAcceptedManuscriptArticleLinkViaUnpaywallText: "Read Article (Accepted Manuscript via Unpaywall)",
			};

			browzine.script = document.createElement("script");
			browzine.script.src = "https://s3.amazonaws.com/browzine-adapters/primo/browzine-primo-adapter.js";
			document.head.appendChild(browzine.script);
		};

		function hideGetItWithHathi() {

			if (!document.getElementsByTagName('prm-request-services')[0]) {
				window.requestAnimationFrame(hideGetItWithHathi);
			} else {
				if (document.getElementsByClassName('umnHathiTrustLink').length) {
					console.log('hathi loaded');
					document.getElementsByTagName('prm-request-services')[0].innerHTML = 'The full text of this item is available through Hathi Trust. See link above.';
				}
			}
		}

		function addressSelector() {
			app.component('prmRequestAfter', {
				bindings: { parentCtrl: '<' },
				template: '<address-selector parent-ctrl="$ctrl.parentCtrl"></address-selector>'
			});
		}

		function preload() {
			for (var i = 0; i < arguments.length; i++) {
				images[i] = new Image();
				images[i].src = preload.arguments[i];
			}
		}

		function privateSetup() {
			console.log("Importing modules.");

			app = angular.module('viewCustom', ['angularLoad', 'hathiTrustAvailability', 'addressSelector', 'thirdIron']);
			console.log("Executing custom JS.");

			angular.element(function () {
				console.log('page loading completed');
				addGoogleAnalytics();
				prmSearchResultAvailabilityLineAfterTemplate();
				chatWidget();
				newSearchSameTab();
				thirdIron();
				addressSelector();
				//hideGetItWithHathi();

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
