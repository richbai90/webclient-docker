<?php
	//Stored query modidied to work strange characters
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
	$strDynFilter = utf8_decode($_POST['dynfilter']);
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilter,"sqlparamstrict", true) : false);
	$strDynFilterCols = $_POST['dynfiltercols'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilterCols,"sqlparamstrict", true) : false);
	$strDynamicFilter = wssProcessDynamicFilter($strDynFilterCols, $strDynFilter);

	//No SQL injection check required for Class, Status & boolAppcodeFilter
	$strCallStatus = $_POST['status'];
	$strCallClass = $_POST['class'];
	$boolAppcodeFilter = $_POST['appcodefilter'];
	if($boolAppcodeFilter == true) {
		$strFilter = " AND opencall.appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
	}

	//--Set Where
	$where = " WHERE ";
	$where .= " opencall.cust_id = '".PrepareForSql($strWssCustId)."'";
	switch ($strCallStatus) {
    case "notstarted":
        if(strtolower(trim($strTable)) == 'opencall' && !$boolAddTables){
            $sqlDatabase = "sw_systemdb";
        } else {
            $sqlDatabase = "swdata";
        }
        $where .= " AND cstm_rel_opencall_archgroups.status = 'Not Started'";
        break;
    case "inprogress":
        if(strtolower(trim($strTable)) == 'opencall' && !$boolAddTables){
            $sqlDatabase = "sw_systemdb";
        } else {
            $sqlDatabase = "swdata";
        }
        $where .= " AND cstm_rel_opencall_archgroups.status = 'In Progress'";
        break;
    case "completed":
        $sqlDatabase = "swdata";
        $where .= " AND cstm_rel_opencall_archgroups.status = 'Completed'";
        break;
    case "all":
        $sqlDatabase = "swdata";
        $where .= " AND opencall.status != 15";
        break;
    default:
        $sqlDatabase = "swdata";
        break;
}

	if (isset($strCallClass) && $strCallClass != "all") {
    $where .= " AND opencall.callclass = '".$strCallClass."'";
  } else {
    $where .= " AND opencall.callclass IN ('ARCH Production','ARCH')";
  }

  $where .= " ".$strFilter;
	$where .= $strDynamicFilter;

	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$sqlCommand = "SELECT COUNT(*) as reqcnt ".$strFromTable.$where;
