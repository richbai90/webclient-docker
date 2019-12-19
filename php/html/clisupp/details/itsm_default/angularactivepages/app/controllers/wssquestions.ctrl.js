(function () {
    'use strict';
    angular
      .module('swActivePages')
      .controller('WssQuestionsCtrl', WssQuestionsCtrl);

    WssQuestionsCtrl.$inject = ['$scope','wssQuestionsDataService','$stateParams','swSessionService','$state'];
    function WssQuestionsCtrl($scope, wssQuestionsDataService, $stateParams, swSessionService, $state)
    {

      /*JS to OpenHtmlWindow in SW Client:
        var strServer = '&[app.webroot]';
		    var strCurrentdd = '&[app.currentdd]';
        global.OpenHtmlWindow("wssm_wiz_input", "frame", strServer + "/clisupp/details/"+ strCurrentdd +"/angularActivePages/#/wssquestions/"+session.sessionId+"/"+OC().callref, "Selfservice Wizard Input", true, 950, 700);
      */

      $scope.dataServ = wssQuestionsDataService;
      $scope.sessionId = $stateParams.sessionId;
      $scope.callref = $stateParams.callref;
      $scope.activeSession = false;
      $scope.arrQuestionAnswers = {};
      swSessionService.bindSession($scope.sessionId).then(function(sessionResp){
        $scope.activeSession = true;
        $scope.dataServ.getQuestionAnswers($scope.callref).then(function(questionAnswers){
          $scope.arrQuestionAnswers = questionAnswers;
        }, function(error){
          console.log(error);
          //Toaster error?
        });
      }, function(error){
        $scope.activeSession = false;
        $state.go('sessionerror');
      });
    }
  })();
