<?php


	//Get Session UserID
	$strCustId = strtolower(trim($session->selfServiceCustomerId));

	//----- SQL Injection & session checks
	$boolNoSQLInjection = true;
	$strWssCustId = strtolower(trim($_POST['custid']));
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strWssCustId,"sqlparamstrict") : false);
	$strInstanceID = $_POST['ssid'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strInstanceID,"sqlparamstrict") : false);


	//Get Keysearch from Userdb for session customer if passed through custid doesn't match session ID
	if($strCustId != $strWssCustId) {
		IncludeApplicationPhpFile("itsm.helpers.php");
		//Get customer ID field for instance
		$strWssCustId = wssGetUserid($strInstanceID, $strCustId);
    if($strWssCustId == "") {
      echo generateCustomErrorString("-303","User Verification Error. Cannot match Customer [".$strWssCustId."] in database. Please contact your Administrator.");
      exit(0);
    }
	}

	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$strSelect = "SELECT ck_config_item, description, ck_config_type, fk_status_level, fk_impact_level FROM config_itemi ";
	$strWhere = "	WHERE (config_itemi.ck_config_type not like 'Service%' AND  config_itemi.ck_config_type not like 'ME->Service%')
								AND config_itemi.fk_userdb = '".PrepareForSql($strWssCustId)."'
								AND config_itemi.isactivebaseline='Yes' ";

	//Execute SQL
	$sqlDatabase = "swdata";
	$sqlCommand = $strSelect.$strWhere;
