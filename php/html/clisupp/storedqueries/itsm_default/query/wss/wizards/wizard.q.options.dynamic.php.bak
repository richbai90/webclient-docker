<?php

  if(!isset($_POST['qtable']) || $_POST['qtable'] =="") {
		throwSuccess();
	}
  if(!isset($_POST['qkeycol']) || $_POST['qkeycol'] =="") {
		throwSuccess();
	}

  $strQTable = $_POST['qtable'];
  $strQKeyCol = $_POST['qkeycol'];
  $strQDisCol = $_POST['qdiscol'];
  $strQDetCol = $_POST['qdetcol'];
  $strQFilter = $_POST['qfilter'];
  $strQFilter = base64_decode($strQFilter);
  $strQFilterCol = $_POST['qfiltercol'];
  $strQFilterColVal = $_POST['qfiltercolval'];

  if( !_validate_url_param($strQTable,"sqlobjectname") ||
      !_validate_url_param($strQKeyCol,"sqlobjectname") ||
      !_validate_url_param($strQDisCol,"sqlobjectname", true) ||
      !_validate_url_param($strQDetCol,"sqlobjectname", true) ||
      !_validate_url_param($strQFilterCol,"sqlobjectname", true) ||
      !_validate_url_param($strQDedCol,"sqlobjectname", true) ||
      !_validate_url_param($strQFilterColVal,"sqlparamstrict", true) ||
      !_validate_url_param($strQFilter,"sqlparamstrict", true) ){
    echo generateCustomErrorString("-303","Failed to process Wizard Question query. SQL Injection Detected. Please contact your Administrator.");
    exit(0);
  }

  $strQuery = "SELECT ".$strQKeyCol." AS keycol ";
  if($strQDisCol != ""){
    $strQuery .= ", ".$strQDisCol." AS discol ";
  } else {
    $strQuery .= ", ".$strQKeyCol." AS discol ";
  }
  if($strQDetCol != ""){
    $strQuery .= ", ".$strQDetCol." AS detcol ";
  }

  $strQuery .= " FROM ".$strQTable;

  $strClauses = "";
  if($strQFilterCol != "" && $strQFilterColVal != ""){
    $strClauses .= " WHERE ".$strQFilterCol." = '".PrepareForSQL($strQFilterColVal)."'";
  }

  if($strQFilter != "") {
    if($strClauses == "") $strClauses .= " WHERE ";
    else $strClauses .= " AND ";
    $strClauses .= $strQFilter;
  }

  $strQuery .= " ".$strClauses." ";
  if($strQDisCol != ""){
    $strQuery .= " ORDER BY ".$strQDisCol;
  } else {
    $strQuery .= " ORDER BY ".$strQKeyCol;
  }

  $sqlDatabase = "swdata";
  $sqlCommand =  $strQuery;
