<?php

$strCustId = strtolower(trim($session->selfServiceCustomerId));
$intCustWebflag = $session->selfServiceWebFlags;
$strWssCustId = strtolower(trim($_POST['custid']));
$strInstanceID = $session->analystId;
$strCustAnalystId = $strCustAnalystId = isset($_POST['aid']) ? strtolower(trim($_POST['aid'])) : "";
if(!isset($_POST['callref']) ||$_POST['callref']==="") {
	throwSuccess();
}

$intCallref = $_POST['callref'];
if(!_validate_url_param($intCallref,"num")){
  echo generateCustomErrorString("-303","Failed to process Call Diary query. SQL Injection Detected. Please contact your Administrator.");
  exit(0);
}

//Check if customer is allowed to view this request
IncludeApplicationPhpFile("itsm.helpers.php");
  $canSeeCall = wssRequestAccess($strInstanceID, $strCustId, $strWssCustId, $intCallref, $intCustWebflag, $strCustAnalystId);
if($canSeeCall != "") {
  echo generateCustomErrorString("-303","Request Verification Error: ".$canSeeCall);
  exit(0);
}

$strCols = "SELECT updatetxt, udid, updatetimex, udcode, repid";
$strTable = " FROM updatedb";
$strWhere = " WHERE callref = ".$intCallref;
$strWhere .= " AND udtype NOT IN (513, 514, 515, 769, 1537, 1538, 1793, 1794, 2561, 3585, 3841)";
//$strWhere .= " AND udtype & 512 = 0 ";
$strOrder = " ORDER BY udindex DESC";

$sqlDatabase = "swdata";
$sqlCommand = $strCols.$strTable.$strWhere.$strOrder;
