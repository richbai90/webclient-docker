(function (){
    'use strict';

    angular
        .module('swActivePages')
        .service('iconPickerDataService', iconPickerDataService);

    iconPickerDataService.$inject = ['$q','XMLMCService'];

    function iconPickerDataService($q, XMLMCService)
    {
      var self = {
      };

      self.updateServiceIcon = function(strIcon, intServID){
        self.updatingIcon = true;
        var deferred = $q.defer();
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("table", "sc_folio");
        xmlmc.addData("fk_cmdb_id", intServID);
        xmlmc.addData("vsb_icon", strIcon);
        xmlmc.invoke("data", "updateRecord", {
          onSuccess: function(params){
            self.updatingIcon = false;
            if(params.rowsEffected === "0"){
              deferred.resolve("0");
            } else {
              deferred.resolve(params);
            }
          },
          onFailure: function(error){
            self.updatingIcon = false;
            deferred.reject(error);
          }
        });
        return deferred.promise;
      };

      return self;
    }
})();
