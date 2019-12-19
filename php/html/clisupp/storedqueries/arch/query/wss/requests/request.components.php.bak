<?php

if(!isset($_POST['callref']) ||$_POST['callref']==="") {
  throwSuccess();
}

$intCallref = $_POST['callref'];
if(!_validate_url_param($intCallref,"num")){
  echo generateCustomErrorString("-303","Failed to process Call Components query. SQL Injection Detected. Please contact your Administrator.");
  exit(0);
}

$strCols = "SELECT name, qty, description";
$strTable = " FROM request_comp";
$strWhere = " WHERE fk_callref = ".$intCallref;
$strOrder = " ORDER BY name ASC";
$sqlDatabase = "swdata";
$sqlCommand = $strCols.$strTable.$strWhere.$strOrder;
