(function (){
    'use strict';

    angular
        .module('swActivePages')
        .service('swSessionService', swSessionService);

    swSessionService.$inject = ['$q','XMLMCService'];

    function swSessionService($q, XMLMCService)
    {
      var self = {
      };

      self.bindSession = function(sessionId){
        var deferred = $q.defer();
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("sessionId", sessionId);
        xmlmc.invoke("session", "bindSession", {
          onSuccess: function(params){
            deferred.resolve("");
          },
          onFailure: function(error){
            deferred.reject(error);
          }
        });
        return deferred.promise;
      };

      return self;
    }
})();
