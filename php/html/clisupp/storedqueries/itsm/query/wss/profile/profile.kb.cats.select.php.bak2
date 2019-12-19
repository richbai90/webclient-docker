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

	$strSelect = "SELECT catalogid, catalogname FROM swkb_catalogs ";

	//Execute SQL
	$sqlDatabase = "swdata";
	$sqlCommand = $strSelect.$strWhere;
