<?php

$strAnalyst = strtolower(trim($session->analystId));

if(!isset($_POST['callref']) ||$_POST['callref']==="") {
  throwSuccess();
}

$intCallref = $_POST['callref'];
if(!_validate_url_param($intCallref,"num")){
  echo generateCustomErrorString("-303","Failed to process Call Attachments query. SQL Injection Detected. Please contact your Administrator.");
  exit(0);
}

$strCols = "SELECT callref, fileid, dataid, filename, addedby, timeadded, sizeu";
$strTable = " FROM system_cfastore";
$strWhere = " WHERE callref = ".$intCallref;
$strWhere .= " AND addedby = '".PrepareForSql($strAnalyst)."'";
$strOrder = " ORDER BY timeadded DESC";
$sqlDatabase = "sw_systemdb";
$sqlCommand = $strCols.$strTable.$strWhere.$strOrder;
