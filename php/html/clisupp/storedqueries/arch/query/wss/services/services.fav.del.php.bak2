<?php
	//Get Session UserID
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strInstanceID = $session->analystId;

	//----- SQL Injection & session checks
	$boolNoSQLInjection = true;
	$strWssCustId = strtolower(trim($_POST['custid']));
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strWssCustId,"sqlparamstrict") : false);
	$intServiceID= $_POST['servid'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($intServiceID,"num") : false);

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

	//Need ALL subscription ID's to remove from favourites as there could be one of a number of service & customer in question

	$strSQL = "SELECT pk_id FROM sc_subscription WHERE fk_service = ".$intServiceID;
	$aRS = get_recordset($strSQL, 'swdata');
	$strSubsIDs = "";
	while ($aRS->Fetch()) {
		if ($strSubsIDs != "") $strSubsIDs .= ",";
		$strSubsIDs .= get_field($aRS,'pk_id');
	}

	//Execute SQL
	$sqlDatabase = "swdata";
	$sqlCommand = "	DELETE FROM sc_favourites WHERE fk_service_id IN (".$strSubsIDs.") AND  fk_keysearch = '".PrepareForSQL($strWssCustId)."'";
