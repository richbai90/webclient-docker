<?php
	//Stored query modidied to work strange characters
	//-- Include ITSM helpers
	IncludeApplicationPhpFile("itsm.helpers.php");
	//-- Include Paging Specific Helpers File
	IncludeApplicationPhpFile("paging.helpers.php");

	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strInstanceID = $session->analystId;

	//-- Check Rights
	$intCustWebflag = $session->selfServiceWebFlags;
	//Check if customer is allowed to view this request list
  if((OPTION_CAN_VIEW_SITECALLS & $intCustWebflag) == 0) {
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

	//Get all sites associated with Customer
	$strSQL  = "SELECT fk_site_name FROM userdb_site WHERE fk_keysearch = '".PrepareForSQL($strWssCustId)."'";
	$aRS = get_recordset($strSQL, 'swdata');
	//-- Check for XMLMC Error
	if($aRS->result==false) {
		echo generateCustomErrorString("-303","Failed to retrieve Customer Site associations. Please contact your Administrator.");
		exit(0);
	}
	$strSites = "";
	while($aRS->Fetch()) {
		$strSiteID  = $aRS->GetValueAsString("fk_site_name");
		if($strSites!="") $strSites .=",";
		$strSites .= "'".PrepareForSql($strSiteID)."'";
	}

	//--Optional
	//Process dynamic filters
	$strDynFilter = $_POST['dynfilter'];
	$strDynFilter = utf8_decode($strDynFilter);
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
		$strFilter .= " AND opencall.appcode IN (".$_core['_sessioninfo']->datasetFilterList.")";
	}

	//--Set Where
	$where = " opencall.site IN (".$strSites.")";
	//-- Set Status clause
	switch ($strCallStatus) {
		case "active":
			if(strtolower(trim($strTable)) == 'opencall' && !$boolAddTables){
				$sqlDatabase = "sw_systemdb";
			} else {
				$sqlDatabase = "swdata";
			}
			$where .= " AND opencall.status IN (1,2,3,5,7,8,9,10,11)";
			break;
		case "resolved":
			if(strtolower(trim($strTable)) == 'opencall' && !$boolAddTables){
				$sqlDatabase = "sw_systemdb";
			} else {
				$sqlDatabase = "swdata";
			}
			$where .= " AND opencall.status = 6";
			break;
		case "closed":
			$sqlDatabase = "swdata";
			$where .= " AND opencall.status IN (16, 18)";
			break;
		case "cancelled":
			$sqlDatabase = "swdata";
			$where .= " AND opencall.status = 17";
			break;
		case "onhold":
			if(strtolower(trim($strTable)) == 'opencall'){
				$sqlDatabase = "sw_systemdb";
			} else {
				$sqlDatabase = "swdata";
			}
			$where .= " AND opencall.status = 4";
			break;
		case "all":
			$sqlDatabase = "swdata";
			$where .= " AND opencall.status != 15";
			break;
		default:
			$sqlDatabase = "swdata";
			break;
	}

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

	$strPagedQuery = sql_page($where, $intPageNo, $strColumns, $strFromTable, $strOrderBy, $intNumRecords);
	$sqlCommand = $strPagedQuery;
