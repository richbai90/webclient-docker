<?php
	//-- Include ITSM helpers
	IncludeApplicationPhpFile("itsm.helpers.php");

	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strInstanceID = $session->analystId;

	//-- Check Rights
	$intCustWebflag = $session->selfServiceWebFlags;
	//Check if customer is allowed to view this request list
	if((OPTION_CAN_VIEW_CALLS & $intCustWebflag) == 0) {
		echo generateCustomErrorString("-303","You do not have access to this request list!");
		exit(0);
	}

	$strWssCustId = strtolower(trim($_POST['custid']));

	//Get Keysearch from Userdb for session customer if passed through custid doesn't match session ID
	if($strCustId != $strWssCustId)
	{
		//Get customer ID field for instance
		$strWssCustId = wssGetUserid($strInstanceID, $strCustId);
		if($strWssCustId == "")
		{
		  echo generateCustomErrorString("-303","User Verification Error. Cannot match Customer [".$strWssCustId."] in database. Please contact your Administrator.");
		  exit(0);
		}
	}
	
	if($session->msSqlInUse)
	{
		$strTop = "TOP 5";
		$strLimit = "";
	}
	else // using SW SQL
	{
		$strTop = "";
		$strLimit = " LIMIT 5 ";		
	}

	$strColumns		= "SELECT " . $strTop . " h_formattedcallref, itsm_title, status ";
	$strFromTable	= " FROM opencall ";
	$strWhere		= " WHERE opencall.appcode IN (".$_core['_sessioninfo']->datasetFilterList.")";
	$strWhere		.=" AND opencall.callclass IN ('Incident','Service Request','Change Request')";
	$strWhere		.=" AND opencall.cust_id = '".PrepareForSql($strWssCustId)."'";
	$strOrderBy		= " ORDER BY lastactdatex desc";

	$sqlDatabase = "swdata";
	$sqlCommand = $strColumns . $strFromTable . $strWhere . $strOrderBy . $strLimit;
