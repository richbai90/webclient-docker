<?php
	//Stored query modidied to work strange characters
	//Get Session UserID
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strInstanceID = $session->analystId;

	//----- SQL Injection & session checks
	$boolNoSQLInjection = true;
	$strWssCustId = strtolower(trim($_POST['custid']));
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strWssCustId,"sqlparamstrict") : false);

	$intNumRecords = $_POST['records'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($intNumRecords,"num") : false);
	$intPageNo = $_POST['start'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($intPageNo,"num") : false);

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

	//Dynamic customer filter
	$strDynFilter = $_POST['dynfilter'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilter,"sqlparamstrict", true) : false);
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
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strCatFilter,"sqlparamstrict", true) : false);
	if ($strCatFilter != "") {
		$strCatFilter = " AND sc_typei.pk_config_type = '".PrepareForSql($strCatFilter)."'";
	}

	//Filter by Owned
	$strOwnServices = $_POST['ownstr'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strOwnServices,"sqlselectcolumns", false) : false);
	if ($strOwnServices != "") {
		$strOwnServices = " AND config_itemi.pk_auto_id IN (".$strOwnServices.") ";
	}

	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	IncludeApplicationPhpFile("paging.helpers.php");

	//Build SQL to get service details from sc_folio and config_itemi
	$strCols = "SELECT sc_typei.type_display,
							ck_config_item,
							cmdb_status,
							config_itemi.pk_auto_id,
							fk_cmdb_id,
							config_itemi.flg_allow_support,
							config_itemi.flg_allow_request,
							fk_status_level,
							vsb_image,
							vsb_title,
							vsb_description,
							vsb_key_features,
							sc_folio.vsb_icon,
							sc_folio.fk_df_onsub,
							sc_folio.fk_df_onreq,
							sc_folio.fk_df_support";

	$strFromTable = " FROM config_itemi, sc_folio, sc_typei";
	$strWhere = "	sc_typei.pk_config_type = config_itemi.catalog_type
								AND sc_folio.fk_cmdb_id = config_itemi.pk_auto_id
								 ".$strOwnServices."
								AND (config_itemi.flg_invisible_public IS NULL OR config_itemi.flg_invisible_public=0)
								AND (config_itemi.service_archived IS NULL OR config_itemi.service_archived != 1)
								AND config_itemi.status_portfolio = 'Catalog' ";
	$strWhere .= $strDynFilter;
	$strWhere .= $strCatFilter;
	$strOrderBy = " ORDER BY vsb_title ASC ";
	
	//-- remove duplicate service subscriptions
	if($session->msSqlInUse)
	{
		$strCols = "(" . $strCols . ", ROW_NUMBER() OVER (PARTITION BY pk_auto_id ORDER BY pk_auto_id) AS partitionOrder ";
		$strWhere .= ") AS tbl WHERE partitionOrder=1 ";
	}
	else
	{
		$strWhere .= " GROUP BY pk_auto_id ";
	}
	
	//Execute SQL
	$sqlDatabase = "swdata";
	$strPagedQuery = sql_page($strWhere, $intPageNo, $strCols, $strFromTable, $strOrderBy, $intNumRecords);
	$sqlCommand = $strPagedQuery;
