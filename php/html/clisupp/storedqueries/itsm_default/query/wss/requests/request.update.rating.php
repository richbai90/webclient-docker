<?php

$strCustId = strtolower(trim($session->selfServiceCustomerId));
$intCustWebflag = $session->selfServiceWebFlags;
$strWssCustId = strtolower(trim($_POST['custid']));

//-- Check Rights
$intCustWebflag = $session->selfServiceWebFlags;
//Check if customer is allowed to update requests
if((OPTION_CAN_UPDATE_CALLS & $intCustWebflag) == 0) {
	echo generateCustomErrorString("-303","You do not have access to rate requests!");
	exit(0);
}

if(!isset($_POST['callref']) ||$_POST['callref']==="") {
	throwSuccess();
}

$intCallref = $_POST['callref'];
$intRating = $_POST['intrating'];
$strRatingText = $_POST['strrating'];

if(!_validate_url_param($intCallref,"num") || !_validate_url_param($intRating,"num") || !_validate_url_param($strRatingText,"sqlparamstrict")){
  echo generateCustomErrorString("-303","Failed to process Call Diary query. SQL Injection Detected. Please contact your Administrator.");
  exit(0);
}

$strRating = "";
switch($intRating) {
	case 1:
		$strRating = "Negative";
		break;
	case 2:
		$strRating = "Neutral";
		break;
	case 3:
		$strRating = "Positive";
		break;
}
$strUpdateMessage = "";
if($strRating != ""){
	$strUpdateMessage = "The customer rating for this request was changed to " .$strRating;
}
if($strUpdateMessage != "") {
	$strUpdateMessage .= "\n";
}
if($strRatingText != ""){
	$strUpdateMessage .= "The customer left the following comment: " .$strRatingText;
}


//Do rating first
$arrOpencallVals = Array();
$arrOpencallVals['c_rating'] = $intRating;
$arrOpencallVals['c_ratingtxt'] = $strRatingText;

$xmlmc = new XmlMethodCall();
$xmlmc->SetParam("callref",$intCallref);
$xmlmc->SetComplexValue("additionalCallValues", "opencall", $arrOpencallVals);

if(!$xmlmc->invoke("selfservice","customerUpdateCallValues"))
{
	echo generateCustomErrorString("-303","Failed up update request rating. Please contact your Administrator.");
	exit(0);
} else {
	//Now add call diary update
	$xmlmc = new XmlMethodCall();
	$xmlmc->SetParam("callref",$intCallref);
	$xmlmc->SetParam("timeSpent","1");
	$xmlmc->SetParam("description",$strUpdateMessage);
	$xmlmc->SetParam("updateSource","Customer (".$strWssCustId.")");
	$xmlmc->SetParam("updateCode","Rating Change");
	if(!$xmlmc->invoke("selfservice","customerUpdateCall"))
	{
		echo generateCustomErrorString("-303","Failed up update diary for request rating. Please contact your Administrator.");
		exit(0);
	} else {
		throwSuccess();
	}
}
