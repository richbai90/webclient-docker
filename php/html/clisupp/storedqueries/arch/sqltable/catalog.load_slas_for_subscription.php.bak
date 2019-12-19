<?php

	//-- will load sql table control using a passed in colname in () and supports optional passed in filter

	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}



	checkMandatoryParams("swc,kvs"); //-- will exit if mandatory param not found

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

	//-- sql
	$sqlDatabase = $db;
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable(). " where ". UC($strWhereCol) ." in (" . $strPreparedKeys . ")";


	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$sqlCommand .= " and " . getStaticSql($_POST["sf"]);
	}

	if($_POST['_exv']!="" && $_POST['_exc']!="")
	{
		$keyColumn = getTablePrimaryKeyName($strTable, $db);
		$sqlCommand .= " and ".$_POST['_exc']." NOT IN (".$_POST['_exv'].")";
	}

	$sqlCommand .= swfc_orderby();
?>