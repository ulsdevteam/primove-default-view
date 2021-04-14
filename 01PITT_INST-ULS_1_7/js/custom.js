(function(){
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

  /* libanswers chat widget 
   * from https://developers.exlibrisgroup.com/blog/embedding-springshare-libchat-widget-into-the-primo-nu/
   */
  function chatWidget() {
    var lc = document.createElement('script');
    lc.type = 'text/javascript';
    lc.async = 'true';
    lc.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'v2.libanswers.com/load_chat.php?hash=a962140fb4e6ffbcdae688be4c64cba5';
    var s = document.getElementsByTagName('script')[0];s.parentNode.insertBefore(lc, s);
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
      bindings: {parentCtrl: `<`},
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
    app = angular.module('viewCustom', ['angularLoad', 'hathiTrustAvailability', 'thirdIron', 'addressSelector']);
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


angular
  .module('addressSelector', [])
  .constant('addressServiceBaseUrl', 'https://' + (location.hostname == 'pitt.primo.exlibrisgroup.com' ? '' : 'dev-') + 'patron.libraries.pitt.edu/')
  .controller('addressSelectorController', ['$scope', '$http', 'addressServiceBaseUrl', function($scope, $http, addressServiceBaseUrl) {
    var self = this;

    this.getJwt = function() {
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

    $scope.showAddresses = function() {
      let selected_home_address =  self.parentCtrl.requestService?._formData?.pickupLocation?.includes('$$USER_HOME_ADDRESS');
      if ($scope.notYetShown && selected_home_address) {
        $scope.notYetShown = false;
        $scope.getAddresses();
      }
      return selected_home_address;
    };

    $scope.getAddresses = function() {
      $scope.statusMessage = 'Loading address information';
      $scope.loading = true;
      let url = addressServiceBaseUrl + 'address/?jwt=' + self.getJwt();
      $http.get(url).then(result => {
        $scope.addresses = result.data;
        for (let address of $scope.addresses) {
          if (address.preferred) {
            $scope.currentAddress = address;
            $scope.loading = false;
            break;
          }
        }
        if ($scope.currentAddress == null) {
          $scope.statusMessage = 'No home address found.';
          $scope.loading = false;
        }
      }, error => {
        $scope.statusMessage = 'An error occurred.';
        $scope.loading = false;
      });
    }

    $scope.usingTempAddress = function() {
      return $scope.currentAddress.address_type[0].value != 'home';
    }

    $scope.openInput = function() {
      $scope.showInput = true;
    }

    $scope.hideInput = function() {
      $scope.showInput = false;
      $scope.statusMessage = "";
      $scope.validationMessage = "";
      $scope.shownAddressLines = 2;
    }

    $scope.setTemporaryAddress = function() {
      $scope.validationMessage = '';
      if (!$scope.addressInput.state_province.trim().match(/^[A-Z]{2}$/)) {
        $scope.validationMessage += 'The state code is not formatted correctly. ';
      }
      if (!$scope.addressInput.postal_code.trim().match(/^\d{5}([-\s]?\d{4})?$/)) {
        $scope.validationMessage += 'The zip code is not formatted correctly.';
      }
      if ($scope.validationMessage != '') {
        return;
      }
      $scope.statusMessage = 'Processing';
      $scope.loading = true;
      $scope.currentAddress = null;
      $scope.showInput = false;
      let url = addressServiceBaseUrl + 'address/?jwt=' + self.getJwt();
      $http.put(url, $scope.addressInput).then(() => {
        $scope.getAddresses();
        $scope.validationMessage = "";
      }, error => {
        $scope.showInput = true;
        $scope.validationMessage = "An error occurred."
        $scope.loading = false;
      });
    }

    $scope.revertToHomeAddress = function() {
      $scope.statusMessage = 'Processing';
      $scope.loading = true;
      $scope.currentAddress = null;
      let url = addressServiceBaseUrl + 'address/?jwt=' + self.getJwt();
      $http.delete(url).then(() => {
        $scope.getAddresses();
      }, error => {
        $scope.statusMessage = "An error occurred."
        $scope.loading = false;
      });
    }

    $scope.showNextLine = function() {
      $scope.shownAddressLines += 1;
    }

  }])
  .component('addressSelector', {
    require: {
      primoExplore: '^primoExplore'
    },
    bindings: {parentCtrl: `<`},
    controller: 'addressSelectorController',
    template:
    `<div class="shipItAddress form-focus layout-margin" style="background-color:#f8f8f8;" layout="row" ng-if="showAddresses()">
      <span ng-if="!currentAddress">{{statusMessage}}<span ng-if="loading" class="loading"></span></span>
      <div layout="column" ng-if="currentAddress && !showInput">
        <span>Item will be shipped to:</span>
        <span ng-if="currentAddress.line1">{{currentAddress.line1}}</span>
        <span ng-if="currentAddress.line2">{{currentAddress.line2}}</span>
        <span ng-if="currentAddress.line3">{{currentAddress.line3}}</span>
        <span ng-if="currentAddress.line4">{{currentAddress.line4}}</span>
        <span ng-if="currentAddress.line5">{{currentAddress.line5}}</span>
        <span>{{currentAddress.city}}, {{currentAddress.state_province}} {{currentAddress.postal_code}}</span>
        <button class="md-button" ng-if="currentAddress && !showInput && !usingTempAddress()" (click)="openInput()">Set Temporary Address</button>
        <button class="md-button" ng-if="currentAddress && !showInput && usingTempAddress()" (click)="openInput()">Update Temporary Address</button>
        <button class="md-button" ng-if="currentAddress && !showInput && usingTempAddress()" (click)="revertToHomeAddress()">Revert to Home Address</button>
      </div>
      <form layout="column" ng-if="showInput">
        <label>Enter the desired address below.</label>
        <label>Note that this is for Library use only and does not change your official address with the University.</label>
        <div style="padding-top:5px;" layout="row">
          <label style="width:50px;">Line 1: </label>
          <input class="md-input" type="text" ng-model="addressInput.line1"></input>
        </div>
        <div style="padding-top:5px;" layout="row" ng-if="shownAddressLines >= 2">
          <label style="width:50px;">Line 2: </label>
          <input class="md-input" type="text" ng-model="addressInput.line2"></input>
        </div>
        <div style="padding-top:5px;" layout="row" ng-if="shownAddressLines >= 3">
          <label style="width:50px;">Line 3: </label>
          <input class="md-input" type="text" ng-model="addressInput.line3"></input>
        </div>
        <div style="padding-top:5px;" layout="row" ng-if="shownAddressLines >= 4">
          <label style="width:50px;">Line 4: </label>
          <input class="md-input" type="text" ng-model="addressInput.line4"></input>
        </div>
        <div style="padding-top:5px;" layout="row" ng-if="shownAddressLines >= 5">
          <label style="width:50px;">Line 5: </label>
          <input class="md-input" type="text" ng-model="addressInput.line5"></input>
        </div>
        <div style="padding-top:5px;" layout="row">
          <label style="width:50px;">City: </label>
          <input class="md-input" type="text" ng-model="addressInput.city"></input>
        </div>
        <div style="padding-top:5px;" layout="row">
          <label style="width:50px;">State: </label>
          <input class="md-input" type="text" ng-model="addressInput.state_province"></input>
          </div>
        <div style="padding-top:5px;" layout="row">
          <label style="width:50px;">Zip: </label>
          <input class="md-input" type="text" ng-model="addressInput.postal_code"></input>
        </div>
        <span>{{validationMessage}}</span>
        <input ng-if="shownAddressLines < 5" type="submit" class="md-button" (click)="showNextLine()" value="Add Another Line"></input>
        <input type="submit" class="md-button" (click)="setTemporaryAddress()" value="Save Temporary Address"></input>
        <input type="submit" class="md-button" (click)="hideInput()" value="Cancel"></input>
      </form>
    </div>`,
  });
})();
