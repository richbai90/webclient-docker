(function() {

'use strict';

var dependencies = [
  'ui.router',
  'ui.bootstrap',
  'ngAnimate',
  'hbSwXmlmc',
  'angular-ladda',
  'toaster'
];

var module = angular.module('swActivePages', dependencies);

module.config(function ($stateProvider, $urlRouterProvider) {
  //Each Active Page will have its own State, and possibly child views
  $stateProvider
    .state('activepages', {
      url: '/',
      templateUrl: 'templates/active-home.html'
    })
    .state('sessionerror', {
      url: '/sessionerror',
      templateUrl: 'templates/session-error.html'
    })
    .state('permissionserror', {
      url: '/permissionserror',
      templateUrl: 'templates/permissions-error.html'
    })
    .state('iconpicker', {
  		url: '/iconpicker/{sessionId}/{serviceId}/{currentIcon}',
  		controller: 'IconPickerCtrl',
  		templateUrl: 'templates/iconpicker/iconpicker.tpl.html',
      cache: false
	  })
    .state('wssquestions', {
  		url: '/wssquestions/{sessionId}/{callref}',
  		controller: 'WssQuestionsCtrl',
  		templateUrl: 'templates/wssquestions/wss.questions.tpl.html',
      cache: false
	  })
    .state('wizconvert', {
  		url: '/wizconvert/{sessionId}',
  		controller: 'WizardConvertCtrl',
  		templateUrl: 'templates/wizconvert/wizconvert.tpl.html',
      cache: false
	  });
    $urlRouterProvider.otherwise('/');
});

module.run(function($location, XMLMCService) {
  XMLMCService.serverUrl = $location.protocol() + "://" + $location.host();
});


module.controller( 'activePagesCtrl', function ($scope) {

});

})();
