<?php
	//Stored query modidied to work strange characters
	$strCategoryID = $_POST['catid'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strCategoryID,"sqlparamstrict") : false);

	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to retrieve Service Category details. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}


	//Build SQL to get subscription catalog types
	$strCols = "SELECT * ";

	$strFromTable = " FROM sc_typei ";
	$strWhere = "	WHERE pk_config_type = '".prepareForSql($strCategoryID)."'";
	$strGroupBy = "";
	$strOrderBy = "";
	//Execute SQL
	$sqlDatabase = "swdata";
	$sqlCommand = $strCols.$strFromTable.$strWhere.$strGroupBy.$strOrderBy;
