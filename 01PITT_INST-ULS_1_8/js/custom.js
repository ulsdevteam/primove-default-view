(function () {
	"use strict";
	'use strict';

	var pittJS = function pittJS() {
		var app;
		var hathi;
		var images = [];

		function addGoogleAnalytics() {
			app.component('prmTopBarBefore', {
				template: '\n\t\t\t\t<!-- Global site tag (gtag.js) - Google Analytics -->\n\t\t\t\t<script async src="https://www.googletagmanager.com/gtag/js?id=UA-129368242-1"></script>\n\t\t\t'
			});
			window.dataLayer = window.dataLayer || [];
			function gtag() {
				dataLayer.push(arguments);
			}
			gtag('js', new Date());

			gtag('config', 'UA-129368242-1');
		}

		/*
		 *  Removes the target attribute from the new search link.
		 *  Will also reset the aria label to be correct (if it's in English)
		 */
		function newSearchSameTab() {
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
			var tabRegexMatch = new RegExp('(?<=\&tab=)(?:[^&#]+)(?=(?:\&|#|$))')
			var tabRegexReplace = new RegExp('(?<=\&tab=)(?<tab>[^&#]+)(?=(?:\&|#|$))')
			var scopeRegexMatch = new RegExp('(?<=\&search_scope=)(?:[^&#]+)(?=(?:\&|#|$))')
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
					expandButton.addEventListener("click", function() {
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
			// Bad bad bad practice! Reused code. See description in reShareIntegrationButton().
			var scopeRegexMatch = new RegExp('(?<=\&search_scope=)(?:[^&#]+)(?=(?:\&|#|$))')
			var expandButton = document.querySelector('div.sidebar-section > md-checkbox');
			var primoReShareScope = "WORLDCATPLUS";
			if (expandButton) {
				// Breaking up the if-statements to avoid null references

				// Trying to avoid a race condition with the process that fills buttons with translations
				// Primo seems to build out the DOM, and then iterate through each item and add
				// aria-labels and text content.
				if (expandButton.hasAttribute("aria-label") && String(window.location).match(scopeRegexMatch) == primoReShareScope && expandButton.classList.contains("ng-empty")) {
					// We're in the ReShare Scope, and the checkbox isn't checked.
					checkAngularCheckbox(expandButton);
				}
			}
			setTimeout(checkBoxIfInReshareScope, 250); 
		}

		/* libanswers chat widget 
		 * from https://developers.exlibrisgroup.com/blog/embedding-springshare-libchat-widget-into-the-primo-nu/
		 */
		function chatWidget() {
			var lc = document.createElement('script');
			lc.type = 'text/javascript';
			lc.async = 'true';
			if (document.location.protocol == 'https:') {
				var protocol = 'https://';
			}
			else {
				protocol='http://';
			}
			lc.src = protocol + 'v2.libanswers.com/load_chat.php?hash=a962140fb4e6ffbcdae688be4c64cba5';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(lc, s);
		}
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
			app = angular.module('viewCustom', ['angularLoad', 'hathiTrustAvailability', 'addressSelector', 'thirdIron']);
			console.log("Executing custom JS.");

			angular.element(function () {
				console.log('page loading completed');
				checkBoxIfInReshareScope();
				addGoogleAnalytics();
				prmSearchResultAvailabilityLineAfterTemplate();
				chatWidget();
				newSearchSameTab();
				thirdIron();
				addressSelector();
				//hideGetItWithHathi();
				//reShareButton();
				reShareIntegrationButton();

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
	angular.module('hathiTrustAvailability', []).constant('hathiTrustBaseUrl', 'https://catalog.hathitrust.org/api/volumes/brief/json/').config(['$sceDelegateProvider', 'hathiTrustBaseUrl', function ($sceDelegateProvider, hathiTrustBaseUrl) {
		var urlWhitelist = $sceDelegateProvider.resourceUrlWhitelist();
		urlWhitelist.push(hathiTrustBaseUrl + '**');
		$sceDelegateProvider.resourceUrlWhitelist(urlWhitelist);
	}]).factory('hathiTrust', ['$http', '$q', 'hathiTrustBaseUrl', function ($http, $q, hathiTrustBaseUrl) {
		var svc = {};

		var lookup = function lookup(ids) {
			if (ids.length) {
				var hathiTrustLookupUrl = hathiTrustBaseUrl + ids.join('|');
				return $http.jsonp(hathiTrustLookupUrl, {
					cache: true,
					jsonpCallbackParam: 'callback'
				}).then(function (resp) {
					return resp.data;
				});
			} else {
				return $q.resolve(null);
			}
		};

		// find a HT record URL for a given list of identifiers (regardless of copyright status)
		svc.findRecord = function (ids) {
			return lookup(ids).then(function (bibData) {
				for (var i = 0; i < ids.length; i++) {
					var recordId = Object.keys(bibData[ids[i]].records)[0];
					if (recordId) {
						return $q.resolve(bibData[ids[i]].records[recordId].recordURL);
					}
				}
				return $q.resolve(null);
			}).catch(function (e) {
				console.error(e);
			});
		};

		// find a public-domain HT record URL for a given list of identifiers
		svc.findFullViewRecord = function (ids) {
			var handleResponse = function handleResponse(bibData) {
				var fullTextUrl = null;
				for (var i = 0; !fullTextUrl && i < ids.length; i++) {
					var result = bibData[ids[i]];
					for (var j = 0; j < result.items.length; j++) {
						var item = result.items[j];
						if (item.usRightsString.toLowerCase() === 'full view') {
							fullTextUrl = result.records[item.fromRecord].recordURL;
							break;
						}
					}
				}
				return $q.resolve(fullTextUrl);
			};
			return lookup(ids).then(handleResponse).catch(function (e) {
				console.error(e);
			});
		};

		return svc;
	}]).controller('hathiTrustAvailabilityController', ['hathiTrust', function (hathiTrust) {
		var self = this;

		self.$onInit = function () {
			if (!self.msg) self.msg = 'Full Text Available at HathiTrust';

			// prevent appearance/request iff 'hide-online'
			if (self.hideOnline && isOnline()) {
				return;
			}

			// prevent appearance/request iff 'hide-if-journal'
			if (self.hideIfJournal && isJournal()) {
				return;
			}

			// prevent appearance/request if item is unavailable
			if (self.ignoreCopyright && !isAvailable()) {
				return;
			}

			// look for full text at HathiTrust
			updateHathiTrustAvailability();
		};

		var isJournal = function isJournal() {
			var format = self.prmSearchResultAvailabilityLine.result.pnx.addata.format[0];
			return !(format.toLowerCase().indexOf('journal') == -1); // format.includes("Journal")
		};

		var isAvailable = function isAvailable() {
			var available = self.prmSearchResultAvailabilityLine.result.delivery.availability[0];
			return (available.toLowerCase().indexOf('unavailable') == -1);
		};

		var isOnline = function isOnline() {
			var delivery = self.prmSearchResultAvailabilityLine.result.delivery || [];
			if (!delivery.GetIt1) return delivery.deliveryCategory.indexOf('Alma-E') !== -1;
			return self.prmSearchResultAvailabilityLine.result.delivery.GetIt1.some(function (g) {
				return g.links.some(function (l) {
					return l.isLinktoOnline;
				});
			});
		};

		var formatLink = function formatLink(link) {
			return self.entityId ? link + '?signon=swle:' + self.entityId : link;
		};

		var isOclcNum = function isOclcNum(value) {
			return value.match(/^(\(ocolc\))\d+$/i);
		};

		var updateHathiTrustAvailability = function updateHathiTrustAvailability() {
			var hathiTrustIds = (self.prmSearchResultAvailabilityLine.result.pnx.addata.oclcid || []).filter(isOclcNum).map(function (id) {
				return 'oclc:' + id.toLowerCase().replace('(ocolc)', '');
			});
			hathiTrust[self.ignoreCopyright ? 'findRecord' : 'findFullViewRecord'](hathiTrustIds).then(function (res) {
				if (res) self.fullTextLink = formatLink(res);
			});
		};
	}]).component('hathiTrustAvailability', {
		require: {
			prmSearchResultAvailabilityLine: '^prmSearchResultAvailabilityLine'
		},
		bindings: {
			entityId: '@',
			ignoreCopyright: '<',
			hideIfJournal: '<',
			hideOnline: '<',
			msg: '@?'
		},
		controller: 'hathiTrustAvailabilityController',
		template: '<span ng-if="$ctrl.fullTextLink" class="umnHathiTrustLink">\
					<md-icon alt="HathiTrust Logo">\
					  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 16 16" enable-background="new 0 0 16 16" xml:space="preserve">  <image id="image0" width="16" height="16" x="0" y="0"\
					  xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAALGPC/xhBQAAACBjSFJN\
					  AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACNFBMVEXuegXvegTsewTveArw\
					  eQjuegftegfweQXsegXweQbtegnsegvxeQbvegbuegbvegbveQbtegfuegbvegXveQbvegbsfAzt\
					  plfnsmfpq1/wplPuegXvqFrrq1znr2Ptok/sewvueQfuegbtegbrgRfxyJPlsXDmlTznnk/rn03q\
					  pVnomkjnlkDnsGnvwobsfhPveQXteQrutHDqpF3qnUnpjS/prmDweQXsewjvrWHsjy7pnkvqqGDv\
					  t3PregvqhB3uuXjusmzpp13qlz3pfxTskC3uegjsjyvogBfpmkHpqF/us2rttXLrgRjrgBjttXDo\
					  gx/vtGznjzPtfhHqjCfuewfrjCnwfxLpjC7wtnDogBvssmjpfhLtegjtnEjrtnTmjC/utGrsew7s\
					  o0zpghnohB/roUrrfRHtsmnlkTbrvH3tnEXtegXvegTveQfqhyHvuXjrrGTpewrsrmXqfRHogRjt\
					  q2Dqewvqql/wu3vqhyDueQnwegXuegfweQPtegntnUvnt3fvxI7tfhTrfA/vzJvmtXLunEbtegrw\
					  egTregzskjbsxI/ouoPsqFzniyrz2K3vyZnokDLpewvtnkv30J/w17XsvYXjgBbohR7nplnso1L0\
					  1Kf40Z/um0LvegXngBnsy5juyJXvsGftrGTnhB/opVHoew7qhB7rzJnnmErkkz3splbqlT3smT3t\
					  tXPqqV7pjzHvunjrfQ7vewPsfA7uoU3uqlruoEzsfQ/vegf///9WgM4fAAAAFHRSTlOLi4uLi4uL\
					  i4uLi4uLi4tRUVFRUYI6/KEAAAABYktHRLvUtndMAAAAB3RJTUUH4AkNDgYNB5/9vwAAAQpJREFU\
					  GNNjYGBkYmZhZWNn5ODk4ubh5WMQERUTl5CUEpWWkZWTV1BUYlBWUVVT19BUUtbS1tHV0zdgMDQy\
					  NjE1MzRXsrC0sraxtWOwd3B0cnZxlXZz9/D08vbxZfDzDwgMCg4JdQsLj4iMio5hiI2LT0hMSk5J\
					  TUvPyMzKzmHIzcsvKCwqLiktK6+orKquYZCuratvaGxqbmlta+8QNRBl6JQ26Oru6e3rnzBx0uQ8\
					  aVGGvJopU6dNn1E8c9bsOXPniYoySM+PXbBw0eIlS5fl1C+PFRFlEBUVXbFy1eo1a9fliQDZYIHY\
					  9fEbNm7avEUUJiC6ddv2HTt3mSuBBfhBQEBQSEgYzOIHAHtfTe/vX0uvAAAAJXRFWHRkYXRlOmNy\
					  ZWF0ZQAyMDE2LTA5LTEzVDE0OjA2OjEzLTA1OjAwNMgVqAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAx\
					  Ni0wOS0xM1QxNDowNjoxMy0wNTowMEWVrRQAAAAASUVORK5CYII=" />\
					  </svg> \
					</md-icon>\
					<a target="_blank" ng-href="{{$ctrl.fullTextLink}}">\
					{{ ::$ctrl.msg }}\
					  <prm-icon external-link="" icon-type="svg" svg-icon-set="primo-ui" icon-definition="open-in-new"></prm-icon>\
					</a>\
				  </span>'
	});

//allow users to set a temporary shipping address for item fullfillment
	angular
		.module('addressSelector', [])
		.constant('addressServiceBaseUrl', 'https://' + (location.hostname == 'pitt.primo.exlibrisgroup.com' ? '' : 'dev-') + 'patron.libraries.pitt.edu/')
		.constant('zipcodeBlacklist', ['15201','15203','15206','15207','15208','15211','15213','15217','15219','15222','15224','15230','15232','15233','15260'])
		.constant('submissionErrorMessage', "An error occurred!")
		.controller('addressSelectorController', ['$scope', '$http', 'addressServiceBaseUrl', 'zipcodeBlacklist', 'submissionErrorMessage', function ($scope, $http, addressServiceBaseUrl, zipcodeBlacklist, submissionErrorMessage) {
			var self = this;
			
			//get logged-in user's authentication token from Primo
			this.getJwt = function () {
				var jwt = self.primoExplore.storageutil.sessionStorage.primoExploreJwt;
				// strip quotes from jwt
				if (jwt.charAt(0) === '"' && jwt.charAt(jwt.length - 1) === '"') {
					jwt = jwt.slice(1, -1);
				}
				return jwt;
			}
			$scope.addresses = [];
			$scope.currentAddress = null;
			$scope.showInput = false;
			$scope.addressInput = {
				line1: "",
				line2: null,
				line3: null,
				line4: null,
				line5: null,
				city: "",
				state_province: "",
				postal_code: "",
			};
			$scope.statusMessage = "";
			$scope.validationMessage = "";
			$scope.shownAddressLines = 2;
			$scope.notYetShown = true;
			$scope.loading = false;

			//we only ship materials to patrons if they don't live nearby
			//check a zipcode blacklist for disallowed shipping destinations
			//disable submission and change on-screen message if addresss is ineligible
			$scope.zipCodeBlacklist = function () {
				//$scope.currentAddress seems to become null during process of reverting back to permanent address
				//don't allow submission until it has a value
				if (!$scope.currentAddress || zipcodeBlacklist.includes($scope.currentAddress.postal_code.substring(0,5))) {
					$scope.eligibleForShipIt = false;
					$scope.shippingAvailability = "cannot";
				}
				//eligible zipcode for shipping.
				else {
					$scope.eligibleForShipIt = true;
					$scope.shippingAvailability = "will";
					self.parentCtrl.formSubmited = false;
				}
			}

			//return true if Home Address is selected from the get-it request form
			$scope.showAddresses = function () {
				if (typeof self.parentCtrl.requestService !== 'undefined' && typeof self.parentCtrl.requestService._formData !== 'undefined' && typeof self.parentCtrl.requestService._formData.pickupLocation !== 'undefined'){
					let selected_home_address = self.parentCtrl.requestService._formData.pickupLocation.indexOf('$$USER_HOME_ADDRESS');
					//disable the submit button by default when Home Address is selected
					//we'll disable later if conditions are met
					self.parentCtrl.formSubmited = selected_home_address!=-1;
					if ($scope.notYetShown && selected_home_address>=0) {
						$scope.notYetShown = false;
						$scope.getAddresses();
					}
					$scope.zipCodeBlacklist();
					return selected_home_address!=-1;
				}
			};
			
			//query the Alma API and retrieve the user's current address
			//load it into the model while giving the user feedback on progress
			$scope.getAddresses = function () {
				$scope.statusMessage = 'Loading address information';
				$scope.loading = true;
				let url = addressServiceBaseUrl + 'address/?jwt=' + self.getJwt();
				$http.get(url).then( function (result) {
					$scope.addresses = result.data;
					for (var i = 0; i < $scope.addresses.length; i++) {
						if ($scope.addresses[i].preferred) {
							$scope.currentAddress = $scope.addresses[i];
							$scope.loading = false;
							break;
						}
					}
					if ($scope.currentAddress == null) {
						$scope.statusMessage = 'No home address found.';
						$scope.loading = false;
					}
				}, function (error) {
					$scope.statusMessage = submissionErrorMessage;
					$scope.loading = false;
				});
			}

			$scope.usingTempAddress = function () {
				return $scope.currentAddress.address_type[0].value != 'home';
			}

			$scope.openInput = function () {
				$scope.showInput = true;
			}

			$scope.hideInput = function () {
				$scope.showInput = false;
				$scope.statusMessage = "";
				$scope.validationMessage = "";
				$scope.shownAddressLines = 2;
			}
			
			//validate and submit temp address form
			//saves valid address data to Alma user API
			$scope.setTemporaryAddress = function () {
				//null == a valid form entry
				$scope.errors = {
					submission: null,
					line1: null,
					city: null,
					state_province: null,
					postal_code: null,
				}

				//validation conditions
				if (!$scope.addressInput.line1) {
					$scope.errors.line1 = 'Line 1 is required';
				}
				if (!$scope.addressInput.city) {
					$scope.errors.city = 'City is required';
				}
				if (!$scope.addressInput.state_province.trim().match(/^[A-Z]{2}$/)) {
					$scope.errors.state_province = 'The state code is not formatted correctly.';
				}
				if (!$scope.addressInput.postal_code.trim().match(/^\d{5}([-\s]?\d{4})?$/)) {
					$scope.errors.postal_code = 'The zip code is not formatted correctly.';
				}
				if (zipcodeBlacklist.includes($scope.addressInput.postal_code.substring(0,5))) {
					$scope.errors.postal_code = 'Addresses in this zip code are not eligible for Ship It service.';
				}

				//don't bother submitting to the Alma API if there is an error
				//Object.values() returns an array of property values
				//we use .some() to return early if any of those array values are not null
				for (let i = 0; i<Object.values($scope.errors).length;i++){
					if (Object.values($scope.errors)[i] !== null){
						return;
					}
				}


				$scope.statusMessage = 'Processing';
				$scope.loading = true;
				$scope.currentAddress = null;
				$scope.showInput = false;
				let url = addressServiceBaseUrl + 'address/?jwt=' + self.getJwt();
				$http.put(url, $scope.addressInput).then(function(){
					$scope.getAddresses();
					$scope.validationMessage = "";
				}, function (error) {
					$scope.showInput = true;
					//if an error occurs, remove the Processing status
					$scope.statusMessage = "";
					$scope.errors.submission = submissionErrorMessage;
					$scope.loading = false;
				});
			}

			$scope.revertToHomeAddress = function () {
				$scope.statusMessage = 'Processing';
				$scope.loading = true;
				$scope.currentAddress = null;
				let url = addressServiceBaseUrl + 'address/?jwt=' + self.getJwt();
				$http.delete(url).then(function(){
					$scope.getAddresses();
				}, function (error){
					$scope.statusMessage = submissionErrorMessage;
					$scope.loading = false;
				});
			}

			$scope.showNextLine = function () {
				$scope.shownAddressLines += 1;
			}

		}])
		.component('addressSelector', {
			require: {
				primoExplore: '^primoExplore'
			},
			bindings: { parentCtrl: '<' },
			controller: 'addressSelectorController',
			template: '<div class="shipItAddress form-focus layout-margin" layout="row" ng-if="showAddresses()">\
			<span ng-if="!currentAddress">{{statusMessage}}<span ng-if="loading" class="loading"></span></span>\
			<div layout="column" ng-if="currentAddress && !showInput">\
				<span ng-if="!eligibleForShipIt" class="zipcodeBlacklistWarning">Addresses near the Pitt campus are not eligible for Ship It service</span>\
				<span>Item {{shippingAvailability}} be shipped to:</span>\
				<span ng-if="currentAddress.line1">{{currentAddress.line1}}</span>\
				<span ng-if="currentAddress.line2">{{currentAddress.line2}}</span>\
				<span ng-if="currentAddress.line3">{{currentAddress.line3}}</span>\
				<span ng-if="currentAddress.line4">{{currentAddress.line4}}</span>\
				<span ng-if="currentAddress.line5">{{currentAddress.line5}}</span>\
				<span>{{currentAddress.city}}, {{currentAddress.state_province}} {{currentAddress.postal_code}}</span>\
				<button class="md-button md-raised" ng-if="currentAddress && !showInput && !usingTempAddress()" (click)="openInput()">Set Temporary Address</button>\
				<button class="md-button md-raised" ng-if="currentAddress && !showInput && usingTempAddress()" (click)="openInput()">Update Temporary Address</button>\
				<button class="md-button md-raised" ng-if="currentAddress && !showInput && usingTempAddress()" (click)="revertToHomeAddress()">Revert to Home Address</button>\
			</div>\
			<form layout="column" ng-if="showInput">\
				<label>Enter the desired address below.</label>\
				<label class="addressFormNote">Note that this is for Library use only and does not change your official address with the University.</label>\
				<div ng-if="errors.submission" class="addressFormSubmissionErrorMessage">{{errors.submission}}</div>\
				<div style="padding-top:5px;" layout="row">\
					<label style="width:50px;">Line 1: </label>\
					<input class="md-input" type="text" ng-model="addressInput.line1"></input>\
				</div>\
				<div ng-if="errors.line1" class="tempAddressError">{{errors.line1}}</div>\
				<div style="padding-top:5px;" layout="row" ng-if="shownAddressLines >= 2">\
					<label style="width:50px;">Line 2: </label>\
					<input class="md-input" type="text" ng-model="addressInput.line2"></input>\
				</div>\
				<div style="padding-top:5px;" layout="row" ng-if="shownAddressLines >= 3">\
					<label style="width:50px;">Line 3: </label>\
					<input class="md-input" type="text" ng-model="addressInput.line3"></input>\
				</div>\
				<div style="padding-top:5px;" layout="row" ng-if="shownAddressLines >= 4">\
					<label style="width:50px;">Line 4: </label>\
					<input class="md-input" type="text" ng-model="addressInput.line4"></input>\
				</div>\
				<div style="padding-top:5px;" layout="row" ng-if="shownAddressLines >= 5">\
					<label style="width:50px;">Line 5: </label>\
					<input class="md-input" type="text" ng-model="addressInput.line5"></input>\
				</div>\
				<div style="padding-top:5px;" layout="row">\
					<label style="width:50px;">City: </label>\
					<input class="md-input" type="text" ng-model="addressInput.city"></input>\
				</div>\
				<div ng-if="errors.city" class="tempAddressError">{{errors.city}}</div>\
				<div style="padding-top:5px;" layout="row">\
					<label style="width:50px;">State: </label>\
					<input class="md-input" type="text" ng-model="addressInput.state_province"></input>\
				</div>\
				<div ng-if="errors.state_province" class="tempAddressError">{{errors.state_province}}</div>\
				<div style="padding-top:5px;" layout="row">\
					<label style="width:50px;">Zip: </label>\
					<input class="md-input" type="text" ng-model="addressInput.postal_code"></input>\
				</div>\
				<div ng-if="errors.postal_code" class="tempAddressError">{{errors.postal_code}}</div>\
				<input ng-if="shownAddressLines < 5" type="submit" class="md-button md-raised" (click)="showNextLine()" value="Add Another Line"></input>\
				<input type="submit" class="md-button md-raised" (click)="setTemporaryAddress()" value="Save Temporary Address"></input>\
				<input type="submit" class="md-button md-raised" (click)="hideInput()" value="Cancel"></input>\
			</form>\
		  </div>',
		});

//third iron integration
angular.module('thirdIron', []).controller('thirdIronController', function($scope) {
	this.$onInit = function () {
		//simulate browzine-primo-adapter.js expected path to prmSearchResultAvailabilityLine 
		//it expects that we bind to this scope through the parentCtrl property on the prmSearchResultAvailabilityLineAfter directive
		//we don't want to alter that directive's controller since it would conflict with Hathi Trust module's use of it
		//so require what we want directly and pretend we're getting to it through the original means 
		$scope.$ctrl.parentCtrl = this.prmSearchResultAvailabilityLine;
		window.browzine.primo.searchResult($scope);

			//The browzine adapter's expected access:
			/*  
			function getScope($scope) {
				return $scope && $scope.$ctrl && $scope.$ctrl.parentCtrl ? $scope.$ctrl.parentCtrl : undefined;
			};
			*/

			//why do the contents links show up outside the 'after' directive?
			/* browzine-primo-adapter.js ~672
				querySelector("prm-search-result-availability-line
				.insertAdjacentHTML()
			*/

	//Ensure 'Report a Problem' link shows up after the Browzine content injected outside the prmSearchResultAvailabilityLineAfter section
		var span = document.createElement("span");
		var reportProblem = document.createElement('a');
		reportProblem.href='https://library.pitt.edu/ask-email?referringUrl=' + window.location.href;
		reportProblem.innerText='Report a Problem';
		span.classList.add('reportProblemLink');
		span.appendChild(reportProblem);
		angular.element(document.getElementsByTagName('prm-search-result-availability-line'))[0].insertAdjacentElement('afterend', span);
	}
	}).component('thirdIron', {
		//Access grandparent scope
		require: {prmSearchResultAvailabilityLine:'^prmSearchResultAvailabilityLine'},
		controller: 'thirdIronController',
  });


})();


//prmBriefResultContainerAfter