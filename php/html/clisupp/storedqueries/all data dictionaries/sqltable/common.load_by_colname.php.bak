<?php

	//-- will load sql table control using a passed in colname in () and supports optional passed in filter

	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}

	checkMandatoryParams("swc"); //-- will exit if mandatory param not found
	checkParamsExist("kvs"); //-- will exit if mandatory param not found
	if($_POST['kvs']=="")
		throwSuccess(0);		//-- return empty recordset

	//-- check if we need to prepare key values
	$strWhereCol = pfs($_POST['swc']);
	$arrKeyValues = explode(",",$_POST['kvs']);
	$strPreparedKeys = "";
	$strTable = swfc_table();
	$db = swfc_source();

	while (list($pos,$keyValue) = each($arrKeyValues))
	{
		if($strPreparedKeys != "")$strPreparedKeys .= ",";
		$strPreparedKeys .= encapsulate($strTable, $strWhereCol,$keyValue,$db);
	}

	$parsedFilter = UC($strWhereCol) ." in (" . $strPreparedKeys . ")";
	$parsedFilter = getAppcodeFilterClause($parsedFilter);

	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$parsedFilter .= " and " . getStaticSql($_POST["sf"]);
	}

	//-- sql
	$sqlDatabase = $db;
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable(). " WHERE " . $parsedFilter . swfc_orderby();

?>