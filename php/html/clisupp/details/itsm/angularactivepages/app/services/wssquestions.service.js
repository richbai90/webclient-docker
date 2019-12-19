(function (){
    'use strict';

    angular
        .module('swActivePages')
        .service('wssQuestionsDataService', wssQuestionsDataService);

    wssQuestionsDataService.$inject = ['$q','XMLMCService'];

    function wssQuestionsDataService($q, XMLMCService)
    {
      var self = {
        'retrievingQuestions': false,
        'questionArray': []
      };

      self.getQuestionAnswers = function(intCallref){
        self.retrievingQuestions = true;
        var questionArray = [];
        var deferred = $q.defer();
        if(!angular.isDefined(intCallref) || intCallref === ''){
          self.retrievingQuestions = false;
          deferred.resolve(questionArray);
        } else {
          var sqparams = "callref="+intCallref;
          var xmlmc = new XMLMCService.MethodCall();
          xmlmc.addParam("storedQuery", "Query/call/common/get_wiz_qs");
          xmlmc.addParam("parameters", sqparams);
          xmlmc.invoke("data", "invokeStoredQuery", {
            onSuccess: function(params){
              if(params.rowData) {
                if( Object.prototype.toString.call( params.rowData.row ) === '[object Array]' ) {
                  var intArrayLength = params.rowData.row.length;
                  //obj is array
                  var strStage = '';
                  for (var i = 0; i < intArrayLength; i++) {
                    if(strStage !== params.rowData.row[i].fk_wiz_stage_title){
                      params.rowData.row[i].first_in_stage = true;
                      strStage = params.rowData.row[i].fk_wiz_stage_title;
                    } else {
                      params.rowData.row[i].first_in_stage = false;
                    }
                    questionArray.push(params.rowData.row[i]);
                  }
                } else {
                  params.rowData.row.first_in_stage = true;
                  questionArray.push(params.rowData.row);
                }
                self.retrievingQuestions = false;
                var processedQuestions = [];
                angular.forEach(questionArray, function(oStageVal){
                  if(oStageVal.first_in_stage === true) {
                    var stageArr = [];
                    stageArr.stageTitle = oStageVal.fk_wiz_stage_title;
                    stageArr.questions = [];
                    var oQuestions = [];
                    angular.forEach(questionArray, function(oQuestionVal){
                      if(oQuestionVal.fk_wiz_stage_title === stageArr.stageTitle){
                        oQuestions.push(oQuestionVal);
                      }
                    });
                    stageArr.questions = oQuestions;
                    processedQuestions.push(stageArr);
                  }
                });
                deferred.resolve(processedQuestions);
              } else {
                self.retrievingQuestions = false;
                deferred.reject('No Questions found!');
              }
            },
            onFailure: function(error){
              self.retrievingQuestions = false;
              deferred.reject(error);
            }
          });
        }
        return deferred.promise;
      };

      return self;
    }
})();
