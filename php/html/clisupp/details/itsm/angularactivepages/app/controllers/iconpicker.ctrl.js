(function () {
    'use strict';
    angular
      .module('swActivePages')
      .controller('IconPickerCtrl', IconPickerCtrl);

    IconPickerCtrl.$inject = ['$rootScope','$scope','iconPickerDataService','$stateParams','swSessionService','$state'];
    function IconPickerCtrl($rootScope, $scope, iconPickerDataService, $stateParams, swSessionService, $state)
    {
      /* SW Client JS
      var strServer = '&[app.webroot]';
    	var strCurrentdd = '&[app.currentdd]';
    	global.OpenHtmlWindow("wssm_service_icon", "modal", strServer + "/clisupp/details/"+strCurrentdd+"/angularActivePages/#/iconpicker/"+session.sessionId+"/"+config_itemi.pk_auto_id+"/"+sc_folio.vsb_icon, "Service Icon Selection", false, 400, 500);
      */

      $scope.updateSuccess = 0;
      $scope.errorMessage = '';
      $scope.dataServ = iconPickerDataService;
      $scope.sessionId = $stateParams.sessionId;
      $scope.serviceId = $stateParams.serviceId;
      $scope.currentIcon = $stateParams.currentIcon;
      $scope.activeSession = false;
      $scope.alerts = [];

      $scope.faIconSelected = {
        value: $scope.currentIcon
      };

      $scope.submitIconChange = function(){
        var alertObj = {};
        $scope.dataServ.updateServiceIcon($scope.faIconSelected.value, $scope.serviceId).then(function(updated){
          if(updated === "0"){
            alertObj = {
              type: 'warning',
              msg: 'The API call was successful but the Icon was not updated.',
              timeout: 2000
            };
            $scope.alerts.push(alertObj);
          } else {
            alertObj = {
              type: 'success',
              msg: 'Icon Updated Successfully!',
              timeout: 2000
            };
            $scope.alerts.push(alertObj);
          }
        }, function(error){
          alertObj = {
            type: 'danger',
            msg: 'The Icon could not be updated ['+error+']',
            timeout: 5000
          };
          $scope.alerts.push(alertObj);
        });
      };

      $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

      $scope.isType = function(alertType, alert){
        return (alertType ? true:false);
      };

      $scope.alertClass = function(index){
        return 'alert-'+$scope.alerts[index].type;
      };

      swSessionService.bindSession($scope.sessionId).then(function(sessionResp){
        $scope.activeSession = true;
      }, function(error){
        $scope.activeSession = false;
        $state.go('sessionerror');
      });
    }
  })();
