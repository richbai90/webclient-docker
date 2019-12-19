(function () {
    'use strict';
    angular
      .module('swActivePages')
      .controller('WizardConvertCtrl', WizardConvertCtrl);

    WizardConvertCtrl.$inject = ['$scope','wizardDataService','$stateParams','swSessionService','$state','toaster','$parse'];
    function WizardConvertCtrl($scope, wizardDataService, $stateParams, swSessionService, $state, toaster, $parse)
    {

      /*JS for client form:
        var strServer = '&[app.webroot]';
        var strCurrentdd = '&[app.currentdd]';
        global.OpenHtmlWindow("wssm_wizard_convert", "frame", strServer + "/clisupp/details/"+strCurrentdd+"/angularActivePages/#/wizconvert/"+session.sessionId, "Wizard Question Conversion", true, 1280, 760);
      */

      $scope.updateSuccess = 0;
      $scope.errorMessage = '';
      $scope.wizServ = wizardDataService;
      $scope.wizServ.wizardsArray = [];
      $scope.sessionId = $stateParams.sessionId;
      $scope.activeSession = false;
      $scope.loadingData = false;
      $scope.backingUpData = false;
      $scope.boolBackupCheckError = false;
      $scope.strBackupCheckError = "";
      $scope.boolBackupCreateError = false;
      $scope.strBackupCreateError = "";


      $scope.accordionClass = function(objStage){
        return (objStage.requiresUpdate ? 'panel-danger' : 'panel-success');
      };

      $scope.updateStageUpdate = function(objStage, keyStage, keyWizard){
        var boolRequiresUpdate = false;
        angular.forEach(objStage.questions, function(objQuestion){
          if(objQuestion.requiresUpdate){
            boolRequiresUpdate = true;
          }
        });
        $scope.wizServ.wizardsArray[keyWizard].stages[keyStage].requiresUpdate = boolRequiresUpdate;
      };

      $scope.tableRowClass = function(objQuestion){
        return (objQuestion.requiresUpdate ? 'danger' : 'success');
      };

      $scope.suggestReplace = function(objQuestion, strColumn){
        var toastObject = {};
        $scope.wizServ.makeSuggestion(objQuestion, strColumn);
        if(objQuestion.suggestedParams !== objQuestion[strColumn]){
          objQuestion[strColumn] = objQuestion.suggestedParams;
          objQuestion.showSuggestion = false;
          toastObject = {
            type: 'info',
            body: "Don't forget to click the blue Save button on the field you have just processed once you have finished editing!",
            title: 'Replacement Suggested!'
          };
          toaster.pop(toastObject);
        } else {
          toastObject = {
            type: 'warning',
            body: "The value of the suggestion matches the original value, so the field value has not changed!",
          };
          toaster.pop(toastObject);
        }
      };

      $scope.restorePrevious = function(objQuestion, strColumn){
        objQuestion[strColumn] = objQuestion.backupParams;
        objQuestion.showSuggestion = true;

      };

      $scope.getWizData = function(){
        $scope.loadingData = true;
        $scope.wizServ.getWizards().then(function(){
          angular.forEach($scope.wizServ.wizardsArray, function(objWizard, keyWizard){
            //Now get Stage info for each Wizard
            $scope.wizServ.getWizardStages(objWizard).then(function(objStages){
              $scope.wizServ.wizardsArray[keyWizard].stages = objStages;
              angular.forEach(objStages, function(objStage, keyStage){
                $scope.wizServ.wizardsArray[keyWizard].stages[keyStage].requiresUpdate = false;
                //Now get questions that require updates for this Wizard Stage
                $scope.wizServ.getStageQuestions(objStage, keyStage, keyWizard).then(function(objQuestions){
                  $scope.wizServ.wizardsArray[keyWizard].stages[keyStage].questions = objQuestions;
                  $scope.loadingData = false;
                });
              });
            });
          });
        }, function(error){
          $scope.loadingData = false;
        });
      };

      $scope.updateSetting = function(objQuestion, strColumn, objStage, keyStage, keyWizard) {
        $scope.wizServ.updateWizardQuestion(objQuestion, strColumn).then(function(){
          //Update stage questions with new data
          $scope.wizServ.getStageQuestions(objStage, keyStage, keyWizard).then(function(objQuestions){
            $scope.wizServ.wizardsArray[keyWizard].stages[keyStage].questions = objQuestions;
            $scope.updateStageUpdate(objStage, keyStage, keyWizard);
          });
        });
      };

      $scope.restoreSetting = function(objQuestion, strColumn, objStage, keyStage, keyWizard) {
        $scope.wizServ.restoreFromBackup(objQuestion, strColumn).then(function(){
          //Update stage questions with new data
          $scope.wizServ.getStageQuestions(objStage, keyStage, keyWizard).then(function(objQuestions){
            $scope.wizServ.wizardsArray[keyWizard].stages[keyStage].questions = objQuestions;
            $scope.updateStageUpdate(objStage, keyStage, keyWizard);
          });
        });
      };

      var toastObject = {};
      swSessionService.bindSession($scope.sessionId).then(function(sessionResp){
        //Check if analyst has permission
        $scope.activeSession = true;
        //Does a backup of the wizards exist? If not, create one...
        $scope.wizServ.doesBackupExist().then(function(boolBackupExists){
          if(!boolBackupExists){
            //Create backups
            $scope.backingUpData = true;
            $scope.wizServ.createBackups().then(function(){
              $scope.backingUpData = false;
              $scope.getWizData();
            }, function(error){
              $scope.backingUpData = false;
              $scope.boolBackupCreateError = true;
              $scope.strBackupCreateError = error;
            });
          } else {
            $scope.getWizData();
          }
          //Go get Wizards information
        }, function(error){
          $scope.backingUpData = false;
          if(error.state.code === "101"){
            $state.go('permissionserror');
          } else {
            $scope.boolBackupCheckError = true;
            $scope.strBackupCheckError = error.error;
          }
        });
      }, function(error){
        $scope.activeSession = false;
        $state.go('sessionerror');
      });
    }

})();
