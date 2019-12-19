<?php

  $strCustId = strtolower(trim($session->selfServiceCustomerId));
  $intCustWebflag = $session->selfServiceWebFlags;
  $strWssCustId = strtolower(trim($_POST['custid']));
  $strInstanceID = $session->analystId;

  if(!isset($_POST['callref']) ||$_POST['callref']==="") {
		throwSuccess();
	}

  $intCallref = $_POST['callref'];
  if(!_validate_url_param($intCallref,"num") || !_validate_url_param($strWssCustId,"sqlparamstrict")){
    echo generateCustomErrorString("-303","Failed to process Call Details query. SQL Injection Detected. Please contact your Administrator.");
    exit(0);
  }

  //Check if customer is allowed to view this request
  IncludeApplicationPhpFile("itsm.helpers.php");
  $canSeeCall = wssRequestAccess($strInstanceID, $strCustId, $strWssCustId, $intCallref, $intCustWebflag);
  if($canSeeCall != "") {
    echo generateCustomErrorString("-303","Request Verification Error: ".$canSeeCall);
    exit(0);
  }

  $sqlDatabase = "swdata";
  $sqlCommand = "SELECT * FROM opencall WHERE callref = ".$intCallref;
