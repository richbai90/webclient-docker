(function (){
    'use strict';

    angular
        .module('swActivePages')
        .service('wizardDataService', wizardDataService);

    wizardDataService.$inject = ['$q','XMLMCService','$parse','toaster','activePageHelpers'];

    function wizardDataService($q, XMLMCService, $parse, toaster, activePageHelpers)
    {
      var self = {
        wizardsLoading: false,
        wizardsError: '',
        updatingValue: false
      };

      self.getWizards = function() {
        var deferred = $q.defer();
        self.wizardsArray = [];
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", "query/form/wssm_wiz/conversion/wizards.get");
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function(params) {
            if(params.rowData) {
              if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
                var intArrayLength = params.rowData.row.length;
                for (var i = 0; i < intArrayLength; i++) {
                  params.rowData.row[i].wizardNeedsUpdate = false;
                  self.wizardsArray.push(params.rowData.row[i]);
                }
              } else {
                params.rowData.row.wizardNeedsUpdate = false;
                self.wizardsArray.push(params.rowData.row);
              }
              deferred.resolve(self.wizardsArray);
            } else {
              deferred.resolve('');
            }
          },
          onFailure: function(error){
            self.wizardsError = error;
            deferred.resolve('');
          }
          });
        return deferred.promise;
      };

      self.getWizardStages = function(objWizard){
        var deferred = $q.defer();
        var stageArray = [];
        var sqparams = "wizid="+objWizard.pk_name;
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", "query/form/wssm_wiz/conversion/wizard.stages.get");
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function(params) {
            if(params.rowData) {
              if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
                var intArrayLength = params.rowData.row.length;
                for (var i = 0; i < intArrayLength; i++) {
                  stageArray.push(params.rowData.row[i]);
                }
              } else {
                stageArray.push(params.rowData.row);
              }
              deferred.resolve(stageArray);
            } else {
              deferred.resolve(stageArray);
            }
          },
          onFailure: function(error){
            self.wizardsError = error;
            deferred.resolve(stageArray);
          }
          });
        return deferred.promise;
      };

      self.getStageQuestions = function(objStage, intStageId, intWizId) {
        var deferred = $q.defer();
        var sqparams = "stageid="+objStage.pk_auto_id;
        var questionArray = [];
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", "query/form/wssm_wiz/conversion/wizard.stage.questions.get");
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function(params) {
            if(params.rowData) {
              if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
                var intArrayLength = params.rowData.row.length;
                for (var i = 0; i < intArrayLength; i++) {
                  params.rowData.row[i].showSuggestion = true;
                  var boolNeedsUpdate = self.questionHaveParams(params.rowData.row[i]);
                  params.rowData.row[i].requiresUpdate = boolNeedsUpdate;

                  if( !angular.isDefined(self.wizardsArray[intWizId].stages[intStageId].requiresUpdate)){
                    self.wizardsArray[intWizId].stages[intStageId].requiresUpdate = boolNeedsUpdate;
                  } else {
                    if( boolNeedsUpdate) {
                      self.wizardsArray[intWizId].stages[intStageId].requiresUpdate = boolNeedsUpdate;
                    }
                  }
                  params.rowData.row[i].jumpFail = false;
                  if(params.rowData.row[i].flg_jumponanswer === "1"){
                    switch (params.rowData.row[i].type) {
                      case 'Textbox':
                      case 'Multiline':
                      case 'Date':
                      case 'Date Range':
                      case 'Checkbox':
                      case 'Option Selector':
                        params.rowData.row[i].jumpFail = true;
                        break;
                      case 'Custom Picker':
                        if(params.rowData.row[i].pickername === 'Configuration Items'){
                          params.rowData.row[i].jumpFail = true;
                          break;
                        }
                    }
                  }
                  if(params.rowData.row[i].jumpFail) {
                    self.wizardsArray[intWizId].stages[intStageId].requiresUpdate = true;
                    self.wizardsArray[intWizId].stages[intStageId].jumpFail = true;
                  }
                  questionArray.push(params.rowData.row[i]);
                }
              } else {
                params.rowData.row.showSuggestion = true;
                params.rowData.row.requiresUpdate = (self.questionHaveParams(params.rowData.row) ? true : false);
                self.wizardsArray[intWizId].stages[intStageId].requiresUpdate = params.rowData.row.requiresUpdate;

                params.rowData.row.jumpFail = false;
                if(params.rowData.row.flg_jumponanswer === "1"){
                  switch (params.rowData.row.type) {
                    case 'Textbox':
                    case 'Multiline':
                    case 'Date':
                    case 'Date Range':
                    case 'Checkbox':
                    case 'Option Selector':
                      params.rowData.row.jumpFail = true;
                      break;
                    case 'Custom Picker':
                      if(params.rowData.row.pickername === 'Configuration Items'){
                        params.rowData.row.jumpFail = true;
                        break;
                      }
                  }
                }
                if(params.rowData.row.jumpFail) {
                  self.wizardsArray[intWizId].stages[intStageId].requiresUpdate = true;
                  self.wizardsArray[intWizId].stages[intStageId].jumpFail = true;
                }
                questionArray.push(params.rowData.row);
              }
              deferred.resolve(questionArray);
            } else {
              deferred.resolve(questionArray);
            }
          },
          onFailure: function(error){
            self.wizardsError = error;
            deferred.resolve(questionArray);
          }
          });
        return deferred.promise;
      };

      self.updateWizardQuestion = function(objQuestion, strColumn){
        self.updatingValue = true;
        var deferred =$q.defer();
        if(strColumn === 'defaultvalue' || strColumn === 'filter' || strColumn === 'sec_filter'){
          var xmlmc = new XMLMCService.MethodCall();
          var strNewVal = $parse(strColumn)(objQuestion);
          var toastObject = {};
          xmlmc.addParam("table", "wssm_wiz_q");
          xmlmc.addData("pk_qid", objQuestion.pk_qid);
          xmlmc.addData(strColumn, strNewVal);
          xmlmc.invoke("data", "updateRecord", {
            onSuccess: function(params) {
              if(params.rowsEffected > 0){
                toastObject = {
                  type: 'success',
                  body: 'Record updated successfully!'
                };
                toaster.pop(toastObject);
              } else {
                toastObject = {
                  type: 'info',
                  body: 'API Call successful, but record has not changed!'
                };
                toaster.pop(toastObject);
              }
              self.updatingValue = false;
              deferred.resolve(true);
            },
            onError: function(error){
              toastObject = {
                type: 'warning',
                body: 'An error was returned from Supportworks when attempting to update Wizard Question: <br>'+error,
                title: 'API Call Failed!'
              };
              toaster.pop(toastObject);
              self.updatingValue = false;
              deferred.resolve(false);
            }
            });
        } else {
          deferred.reject('Incorrect column passed.');
        }
        return deferred.promise;
      };

      self.doesBackupExist = function(){
        var boolExists = false;
        var deferred = $q.defer();
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", "query/form/wssm_wiz/conversion/wizard.questions.backup.count");
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function(params) {
            if(params.rowData) {
              if(params.rowData.row.cnt > 0){
                deferred.resolve(true);
              } else {
                deferred.resolve(false);
              }
            } else {
              deferred.reject(params);
            }
          },
          onFailure: function(error, state){
            var objError = {
              error: error,
              state: state
            };
            deferred.reject(objError);
          }
          });
        return deferred.promise;
      };

      self.createBackups = function(){
        var deferred = $q.defer();
        var xmlmc = new XMLMCService.MethodCall();
        xmlmc.addParam("storedQuery", "query/form/wssm_wiz/conversion/wizard.questions.backup.create");
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function(params) {
            var toastObject = {
              type: 'success',
              body: '<strong>'+params.rowsEffected + '</strong> Wizard Questions backed up successfully!'
            };
            toaster.pop(toastObject);
            deferred.resolve(params);
          },
          onFailure: function(error){
            deferred.reject(error);
          }
          });
        return deferred.promise;
      };

      self.restoreFromBackup = function(objQuestion,strColumn){
        var toastObject = {};
        var deferred = $q.defer();
        var xmlmc = new XMLMCService.MethodCall();
        var sqparams = "qid="+objQuestion.pk_qid;
        sqparams += "&column="+strColumn;
        xmlmc.addParam("storedQuery", "query/form/wssm_wiz/conversion/wizard.questions.backup.restore");
        xmlmc.addParam("parameters", sqparams);
        xmlmc.invoke("data", "invokeStoredQuery", {
          onSuccess: function(params) {
            if(params.rowsEffected > 0){
              toastObject = {
                type: 'success',
                body: 'Wizard Question restored from backup successfully!'
              };
              toaster.pop(toastObject);
            } else {
              toastObject = {
                type: 'warning',
                body: 'API successful, but Wizard Question was not restored from backup!'
              };
              toaster.pop(toastObject);
            }
            deferred.resolve(params);
          },
          onFailure: function(error){
            toastObject = {
              type: 'error',
              body: 'API call failed to restore Wizard Question from backup: '+error
            };
            toaster.pop(toastObject);
            deferred.reject(error);
          }
          });
        return deferred.promise;
      };

      self.makeSuggestion = function(objQuestion, strColumn){
        objQuestion.suggestedParams = $parse(strColumn)(objQuestion);
        objQuestion.backupParams = $parse(strColumn)(objQuestion);
        var dynamicParams = [];
        var objDynVars = activePageHelpers.getRegexMatches(/!\[(.*?)\]!/gi, objQuestion.suggestedParams);
        angular.forEach(objDynVars, function(objVal, objKey){
          var paramSuggest = {};
          paramSuggest.original = objVal;
          paramSuggest.innerElements = [];
          var prepareForSqlMatches = activePageHelpers.getRegexMatches(/prepareforsql\(([\S\s]*)\)/i, objVal);
          var pfsMatches = activePageHelpers.getRegexMatches(/pfs\(([\S\s]*)\)/i, objVal);
          if(prepareForSqlMatches.length > 0 || pfsMatches.length > 0) {
            angular.forEach(prepareForSqlMatches, function(pfsVal){
              paramSuggest.innerElements.push(pfsVal);
            });
            angular.forEach(pfsMatches, function(pfsVal){
              paramSuggest.innerElements.push(pfsVal);
            });
          } else {
            paramSuggest.innerElements.push(objVal);
          }
          dynamicParams.push(paramSuggest);
        });

        //Now process $_SESSION vars
        angular.forEach(dynamicParams, function(dynVal, dynKey){
          angular.forEach(dynVal.innerElements, function(elementVal, elementKey){
            var innerElementSuggest = [];
            innerElementSuggest.innerElement = dynVal.original;
            innerElementSuggest.suggestion = '';
            var strSuggest  = '';
            var sessionVarMatches = activePageHelpers.getRegexMatches(/\$_SESSION\[['"‘]([\S\s]*)['"’]\]/i, elementVal);
            if(sessionVarMatches.length > 0){
              angular.forEach(sessionVarMatches, function(sugVal, sugKey){
                sugVal = "|" + sugVal;
                var strNewVal = sugVal.replace("|userdb_", "custDetails.");
                strNewVal = strNewVal.replace("|company_", "orgDetails.");
                strSuggest += strNewVal;
              });
            } else {
              strSuggest = elementVal;
            }
            dynamicParams[dynKey].suggestion = strSuggest;
          });
        });

        angular.forEach(dynamicParams, function(objParam){
          objQuestion.suggestedParams = objQuestion.suggestedParams.replace(objParam.original, objParam.suggestion);
        });
      };

      self.getDynParams = function(strValue){
        return strValue.match(/!\[(.*?)\]!/g);
      };

      self.stringHaveParams = function(strValue) {
        var boolResponse = false;
        if(angular.isDefined(strValue)){
          var objParam = strValue.match(/!\[(.*?)\]!/g);
          if(objParam.length > 0) {
            angular.forEach(objParam, function(objMatch, keyMatch){
              var objInnerParam = strValue.match(/!\[(cust|org)details.([a-z_]{2,})\]!/gi);
              if(objInnerParam === null || objInnerParam === 0){
                boolResponse = true;
              }
            });
          }
        }
        return boolResponse;
      };

      self.questionHaveParams = function(objQuestion){
        var objParam = {};
        if(angular.isDefined(objQuestion.defaultvalue)){
          return self.stringHaveParams(objQuestion.defaultvalue);
        }
        if(angular.isDefined(objQuestion.filter)){
          return self.stringHaveParams(objQuestion.filter);
        }
        if(angular.isDefined(objQuestion.sec_filter)){
          return self.stringHaveParams(objQuestion.sec_filter);
        }
        return false;
      };

      return self;
    }
})();
