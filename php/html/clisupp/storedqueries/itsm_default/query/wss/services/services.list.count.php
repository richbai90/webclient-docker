<?php
	//Stored query modidied to work strange characters
	//Get Session UserID
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strInstanceID = $session->analystId;

	//----- SQL Injection & session checks
	$boolNoSQLInjection = true;
	$strWssCustId = strtolower(trim($_POST['custid']));
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strWssCustId,"sqlparamstrict") : $boolNoSQLInjection);


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

	//Get Subscribed Service IDs
	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();
	$serviceKeys = $service->get_customer_services($strWssCustId, true, false);

	if ($serviceKeys == "") {
			throwSuccess();
	}

	//Dynamic customer filterilter = $_POST['dynfilter'];
	$strDynFilter = $_POST['dynfilter'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilter,"sqlparamstrict", true) : $boolNoSQLInjection);
	if ($strDynFilter != "") {
		$strDynFilter = utf8_decode($strDynFilter);
		$strDynFilter = " AND (	sc_typei.type_display LIKE '%".PrepareForSQL($strDynFilter)."%'
														OR vsb_title LIKE '%".PrepareForSQL($strDynFilter)."%'
														OR vsb_description LIKE '%".PrepareForSQL($strDynFilter)."%'
														OR sc_folio.fld_kw1 LIKE '".PrepareForSQL($strDynFilter)."%'
														OR sc_folio.fld_kw2 LIKE '".PrepareForSQL($strDynFilter)."%'
														OR sc_folio.fld_kw3 LIKE '".PrepareForSQL($strDynFilter)."%' )";
	}

	//Filter by category
	$strCatFilter = $_POST['cat'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strCatFilter,"sqlparamstrict", true) : $boolNoSQLInjection);
	if ($strCatFilter != "") {
		$strCatFilter = " AND sc_typei.pk_config_type = '".prepareForSql($strCatFilter)."'";
	}

	//Filter by Favourites
	$strFavServices = $_POST['favstr'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strFavServices,"sqlselectcolumns", true) : $boolNoSQLInjection);
	if ($strFavServices != "") {
		$strFavServices = " AND config_itemi.pk_auto_id IN (".$strFavServices.")";
	}


	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	//Build SQL to get service details from sc_folio and config_itemi
	$strFromTable = " FROM config_itemi, sc_folio, sc_typei ";
	$strWhere = "	WHERE sc_typei.pk_config_type = config_itemi.catalog_type
								AND sc_folio.fk_cmdb_id = config_itemi.pk_auto_id
								AND config_itemi.pk_auto_id in (".$serviceKeys.")
								AND (config_itemi.flg_invisible_public IS NULL OR config_itemi.flg_invisible_public=0)
								AND (service_archived IS NULL OR service_archived != 1)
								AND config_itemi.status_portfolio = 'Catalog' ";
	$strWhere .= $strDynFilter;
	$strWhere .= $strFavServices;
	$strWhere .= $strCatFilter;

	//Execute SQL
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT COUNT(pk_auto_id) AS cnt".$strFromTable.$strWhere;
