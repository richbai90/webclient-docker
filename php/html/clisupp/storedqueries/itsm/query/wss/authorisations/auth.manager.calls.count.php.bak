<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	//Get Session UserID
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strInstanceID = $session->analystId;

	//-- Check Rights
	$intCustWebflag = $session->selfServiceWebFlags;
	//Check if customer is allowed to view this request list
	if((OPTION_CAN_VIEW_CALLS & $intCustWebflag) == 0) {
		echo generateCustomErrorString("-303","You do not have access to this request list!".$strSessionVar);
		exit(0);
	}

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
	$strTableJoins = wssProcessTableJoins($strAdditionalTables);
	$strFromTable = " FROM " . $strFromTable.$strTableJoins;
	//END processing table join data

	//Get auth ID field for wss session if passed through custid doesn't match session customer ID
	$strAuthIdFld = "keysearch";
	if($strCustId != $strWssCustId) {
		//Get customer ID field for instance
		$strSQL = "SELECT value FROM websession_config WHERE instanceid = '".PrepareForSQL($strInstanceID)."' AND name ='ac_id'";
		$aRS = get_recordset($strSQL, 'sw_systemdb');
		if ($aRS->Fetch()) {
			$strAuthIdFld = get_field($aRS,"value");
		} else {
			echo generateCustomErrorString("-303","Failed to retrieve Web Session Configuration. Please contact your Administrator.");
			exit(0);
		}

		//If auth field is keysearch, and session cust ID doesn't match passed-through cust ID,
		//Then customer is attempting to view requests that are not their own - end fail.
		if($strAuthIdFld == 'keysearch') {
			echo generateCustomErrorString("-303","Requested Customer ID does not match Session Customer ID. Please contact your Administrator.");
			exit(0);
		}

	}
	//Get manager ID from Userdb for session customer
	$strManagerId = "";
	$strSQL = "SELECT keysearch, fk_manager FROM userdb WHERE ".$strAuthIdFld." = '".PrepareForSQL($strCustId)."'";
	$aRS = get_recordset($strSQL, 'swdata');
	if ($aRS->Fetch()) {
		$strManagerId = get_field($aRS,'fk_manager');
		$strCustId = get_field($aRS, 'keysearch');
	} else {
		echo generateCustomErrorString("-303","Failed to retrieve Customer Manager details. Please contact your Administrator.");
		exit(0);
	}

	if($strManagerId == "") {
		throwSuccess();
	}

	//Process dynamic filters
	$strDynFilter = utf8_decode($_POST['dynfilter']);
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilter,"sqlparamstrict", true) : false);
	$strDynFilterCols = $_POST['dynfiltercols'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilterCols,"sqlparamstrict", true) : false);
	$strDynamicFilter = wssProcessDynamicFilter($strDynFilterCols, $strDynFilter);

	//No SQL injection check required for Class, Status & boolAppcodeFilter
	$strCallClass = $_POST['class'];
	$boolAppcodeFilter = $_POST['appcodefilter'];
	if($boolAppcodeFilter == true) {
		$strFilter = " AND opencall.appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
	}

	//--Set Where
	$where = "	WHERE opencall.bpm_stage_id = bpm_oc_auth.fk_stage_id
							AND opencall.status < 15
							AND opencall.cust_id = '".PrepareForSql($strCustId)."'
							AND bpm_waitingauth=1
							AND bpm_managerid = '".PrepareForSql($strManagerId)."'
							AND bpm_oc_auth.status='Pending authorisation'
							AND fk_auth_id = '".PrepareForSql($strManagerId)."'
							AND bpm_oc_auth.authortype != 'Analyst'";

	if (isset($strCallClass) && ($strCallClass == "Incident" || $strCallClass == "Service Request" || $strCallClass == "Change Request")) {
		$where .= " AND opencall.callclass = '".$strCallClass."'";
	} else {
		$where .= " AND opencall.callclass IN ('Incident','Service Request','Change Request')";
	}

	$where .= " ".$strFilter;
	$where .= $strDynamicFilter;

	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT COUNT(*) as reqcnt FROM ( SELECT DISTINCT fk_callref,fk_stage_id ".$strFromTable.$where . ") AS reqs";
