<?php
	//-- Include ITSM helpers
	IncludeApplicationPhpFile("itsm.helpers.php");

	//Get Session UserID
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strInstanceID = $session->analystId;

	//----- SQL Injection & session checks
	$boolNoSQLInjection = true;
	$strWssCustId = strtolower(trim($_POST['custid']));
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strWssCustId,"sqlparamstrict") : false);

	$strColumns = "SELECT " . $_POST['columns'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strColumns,"sqlparamstrict") : false);
	$strFromTable = $_POST['table'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strFromTable,"sqlparamstrict") : false);
  $strAdditionalTables = $_POST['addtables'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strAdditionalTables,"sqlparamstrict", true) : false);

	//Process table joins
	$boolAddTables = false;
	$strTableJoins = wssProcessTableJoins($strAdditionalTables);
	if($strTableJoins != ""){
		//Set boolAddTables to true - to prevent the use of the cache and force querying of swdata
		$boolAddTables = true;
	}
	$strFromTable = " FROM " . $strFromTable.$strTableJoins;
	//END processing table join data

	//Get Keysearch from Userdb for session customer if passed through custid doesn't match session ID
	if($strCustId != $strWssCustId) {
		//Get customer ID field for instance
		$strWssCustId = wssGetUserid($strInstanceID, $strCustId);
    if($strWssCustId == "") {
      echo generateCustomErrorString("-303","User Verification Error. Cannot match Customer [".$strWssCustId."] in database. Please contact your Administrator.");
      exit(0);
    }
	}

	//Process dynamic filters
	$strDynFilter = $_POST['dynfilter'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilter,"sqlparamstrict", true) : false);
	$strDynFilterCols = $_POST['dynfiltercols'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilterCols,"sqlparamstrict", true) : false);
	$strDynamicFilter = wssProcessDynamicFilter($strDynFilterCols, $strDynFilter);

	$strOrderBy = $_POST['orderby'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strOrderBy,"sqlparamstrict", true) : false);
	if($strOrderBy != "") {
		$strOrderBy = " ORDER BY ".$strOrderBy;
	}

	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	//Build SQL to get CI details
	$strWhere = "	WHERE (config_itemi.ck_config_type not like 'Service%' AND  config_itemi.ck_config_type not like 'ME->Service%')
								AND config_relme.fk_me_key = '".PrepareForSql($strWssCustId)."'
								AND config_itemi.isactivebaseline='Yes' ";
	$strWhere .= $strDynamicFilter;

	//Execute SQL
	$sqlDatabase = "swdata";
	$strQuery = $strColumns. $strFromTable.$strWhere.$strOrderBy;
	$sqlCommand = $strQuery;
