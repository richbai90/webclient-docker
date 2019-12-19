<?php
	//Stored query modidied to work strange characters
	//Get Session UserID
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strInstanceID = $session->analystId;

	//----- SQL Injection & session checks
	$boolNoSQLInjection = true;
	$strWssCustId = strtolower(trim($_POST['custid']));
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strWssCustId,"sqlparamstrict") : $boolNoSQLInjection );

	

	
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
	
	//Get Subscribed Service IDs
	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();
	$serviceKeys = $service->get_customer_services	($strWssCustId, true, false);

	if ($serviceKeys == "") {
			throwSuccess();
	}
	
	$oUserRec = get_record("userdb", $strCustId);
	

	//Dynamic customer filterilter = $_POST['dynfilter'];
	$strDynFilter = $_POST['dynfilter'];

	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilter,"sqlparamstrict", true) : $boolNoSQLInjection);
	if ($strDynFilter != "") {
		$strDynFilter = utf8_decode($strDynFilter);
		$strDynFilter = " AND (	service_name LIKE '%".PrepareForSQL($strDynFilter)."%'
														OR service_desc LIKE '%".PrepareForSQL($strDynFilter)."%'
														OR vsb_title LIKE '%".PrepareForSQL($strDynFilter)."%'
														OR vsb_description LIKE '%".PrepareForSQL($strDynFilter)."%'
														OR description LIKE '".PrepareForSQL($strDynFilter)."%'
														OR notes LIKE '".PrepareForSQL($strDynFilter)."%')";
	}

	//Filter by category
	$strCatFilter = $_POST['cat'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strCatFilter,"sqlparamstrict", true) : $boolNoSQLInjection);
	if ($strCatFilter != "") {
		$strCatFilter = " AND catalog_type = '".prepareForSql($strCatFilter)."'";
	}

	//Filter by Favourites
	$strFavServices = $_POST['favstr'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strFavServices,"sqlselectcolumns", true) : $boolNoSQLInjection);
	if ($strFavServices != "") {
		$strFavServices = " AND config_itemi.pk_auto_id IN (".$strFavServices.")";
	}


	$strFromTable = " FROM sc_subscription, config_itemi, sc_folio  ";
	$strWhere = "	WHERE sc_folio.fk_cmdb_id = sc_subscription.fk_service AND config_itemi.pk_auto_id = sc_subscription.fk_service AND rel_type='VIEW' AND (service_archived IS NULL OR service_archived != 1)
			AND FK_SERVICE NOT in (".$serviceKeys.") AND ((fk_me_table = 'userdb' AND fk_me_key = '".$strCustId."') OR (fk_me_table = 'department' AND fk_me_key in ('".$oUserRec['department']."')) OR 
			(fk_me_table = 'company' AND fk_me_key = '".$oUserRec['fk_company_id']."'))";
	
	$strWhere .= $strDynFilter;
	$strWhere .= $strFavServices;
	$strWhere .= $strCatFilter;

	//Execute SQL
	$sqlDatabase = "swdata";
	
	$sqlCommand = "SELECT COUNT(DISTINCT(ck_config_item)) AS cnt".$strFromTable.$strWhere;
	
?>