<?php
	//Stored query modidied to work strange characters
	//-- Include ITSM helpers
	IncludeApplicationPhpFile("itsm.helpers.php");

	//Get Session UserID
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strInstanceID = $session->analystId;

	//SQL Injection checks
	//--Required Columns
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
	$strAuthIDFld = 'keysearch';
	if($strCustId != $strWssCustId) {
		//Get customer ID field for instance
		$strAuthIdFld = "";
		$strSQL = "SELECT value FROM websession_config WHERE instanceid = '".PrepareForSQL($strInstanceID)."' AND name ='ac_id'";
		$aRS = get_recordset($strSQL, 'sw_systemdb');
		if ($aRS->Fetch() && $boolCheckInstanceID) {
			$strAuthIDFld = get_field($aRS,"value");
		} else {
			echo generateCustomErrorString("-303","Failed to retrieve Web Session Configuration. Please contact your Administrator.");
			exit(0);
		}
		//If auth field is keysearch, and session cust ID doesn't match passed-through cust ID,
		//Then customer is attempting to view requests that are not their own - end fail.
		if($strAuthIDFld == 'keysearch') {
			echo generateCustomErrorString("-303","Requested Customer ID does not match Session Customer ID. Please contact your Administrator.");
			exit(0);
		}
	}

	//Get Keysearch from Userdb for session customer
	$strSQL = "SELECT flg_manager, keysearch FROM userdb WHERE ".$strAuthIDFld." = '".PrepareForSQL($strCustId)."'";
	$aRS = get_recordset($strSQL, 'swdata');
	if ($aRS->Fetch()) {
		$strCustId = get_field($aRS,'keysearch');
		$intFlgManager = get_field($aRS,'flg_manager');
	} else {
		echo generateCustomErrorString("-303","Failed to retrieve Customer Record details. Please contact your Administrator.");
		exit(0);
	}

	//Check if customer is allowed to view this request list
	if($intFlgManager != 1) {
		echo generateCustomErrorString("-303","You do not have access to this request list!");
		exit(0);
	}

	//Process dynamic filters
	$strDynFilter = $_POST['dynfilter'];
	$strDynFilter = utf8_decode($strDynFilter);
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilter,"sqlparamstrict", true) : false);
	$strDynFilterCols = $_POST['dynfiltercols'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilterCols,"sqlparamstrict", true) : false);
	$strDynamicFilter = wssProcessDynamicFilter($strDynFilterCols, $strDynFilter);

	//No SQL injection check required for Class, Status & boolAppcodeFilter
	$strCallStatus = $_POST['status'];
	$strCallClass = $_POST['class'];
	$boolAppcodeFilter = $_POST['appcodefilter'];
	$strFilter = "";
	if($boolAppcodeFilter == true) {
		$strFilter .= " AND opencall.appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
	}

	//--Set Where
	$where = " WHERE opencall.cust_id = userdb.keysearch and userdb.fk_manager = '".PrepareForSql($strCustId)."'";
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

	$where .= " ".$strFilter;
	$where .= $strDynamicFilter;

	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$sqlCommand = "SELECT COUNT(*) as reqcnt ".$strFromTable.$where;
