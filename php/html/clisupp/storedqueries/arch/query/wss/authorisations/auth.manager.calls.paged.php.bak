<?php
	//-- Include ITSM helpers
	IncludeApplicationPhpFile("itsm.helpers.php");
	//-- Include Paging Specific Helpers File
	IncludeApplicationPhpFile("paging.helpers.php");
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strInstanceID = $session->analystId;

	//-- Check Rights
	$intCustWebflag = $session->selfServiceWebFlags;
	//Check if customer is allowed to view this request list
	if((OPTION_CAN_VIEW_CALLS & $intCustWebflag) == 0) {
		echo generateCustomErrorString("-303","You do not have access to this request list!");
		exit(0);
	}

	//Get Values
	if(!isset($_POST['records']) ||$_POST['start']=="") {
		throwSuccess();
	}

	//SQL Injection checks
	//--Required Columns
	$boolNoSQLInjection = true;
	$strWssCustId = strtolower(trim($_POST['custid']));
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strWssCustId,"sqlparamstrict") : false);
	$intNumRecords = $_POST['records'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($intNumRecords,"num") : false);
	$intPageNo = $_POST['start'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($intPageNo,"num") : false);

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
	//Get managerid from Userdb for session customer
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

	//--Optional
  //Process dynamic filters
	$strDynFilter = utf8_decode($_POST['dynfilter']);
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilter,"sqlparamstrict", true) : false);
	$strDynFilterCols = $_POST['dynfiltercols'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilterCols,"sqlparamstrict", true) : false);
	$strDynamicFilter = wssProcessDynamicFilter($strDynFilterCols, $strDynFilter);

	$strOrderBy = $_POST['orderby'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strOrderBy,"sqlparamstrict", true) : false);
	if($strOrderBy != "") {
		$strOrderBy = " ORDER BY ".$strOrderBy;
	}

	//No SQL injection check required for Class, Status & boolAppcodeFilter
	$strCallStatus = $_POST['status'];
	$strCallClass = $_POST['class'];
	$boolAppcodeFilter = $_POST['appcodefilter'];
	$strFilter = "";
	if($boolAppcodeFilter == true) {
		$strFilter = " AND opencall.appcode IN (".$_core['_sessioninfo']->datasetFilterList.")";
	}

	//--Set Where
	$where = "	opencall.status < 15
							AND opencall.cust_id = '".PrepareForSql($strCustId)."'
							AND opencall.bpm_stage_id = bpm_oc_auth.fk_stage_id
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

	$where .= $strFilter;
	$where .= $strDynamicFilter;

	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}
	
	//-- remove duplicate authorisations
	if($session->msSqlInUse)
	{
		$strOrderBy = " ORDER BY callref DESC ";
		$strColumns = "(" . $strColumns . ", ROW_NUMBER() OVER (PARTITION BY callref ORDER BY callref) AS partitionOrder ";
		$where .= ") AS tbl WHERE partitionOrder=1 ";
		$_POST['PartitionedList'] = true;
	}
	else
	{
		$strWhere .= " GROUP BY callref ";
	}
	

	$strPagedQuery = sql_page($where, $intPageNo, $strColumns, $strFromTable, $strOrderBy, $intNumRecords);
	$sqlDatabase = "swdata";
	$sqlCommand = $strPagedQuery;
