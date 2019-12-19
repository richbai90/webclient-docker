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

	//Execute SQL
	$sqlDatabase = "swdata";

	$customerID = $_POST['custid'];
	$serviceID = $_POST['sid'];

	//$sqlCommand = "select itsm_fk_service,bpm_progress_title, status, callclass, c_rating, callref, itsm_title, priority, logdatex, fixbyx, bpm_progress, bpm_progress_title, bpm_progress_perc, bpm_progress_fail, bpm_workflow_id, h_formattedcallref from opencall where cust_id = 'jdoe' and itsm_fk_service =8 and status in (16,18) order by closedatex DESC";
	$sqlCommand = "select h_formattedcallref, itsm_title, priority, logdatex, fixbyx, status from opencall where cust_id = '".$customerID."' and itsm_fk_service =".$serviceID." and status in (16,18) order by closedatex DESC";
?>
