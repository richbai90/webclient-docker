(function () {
    'use strict';
    angular
        .module('swActivePages')
        .directive('swSpinner',swSpinner);

    function swSpinner()
    {
      return {
        'restrict':'E',
        'templateUrl': 'app/directives/sw-spinner/sw-spinner.tpl.html',
        'scope': {
          'isLoading':'=',
          'message':'@'
        }
      };
    }
})();
