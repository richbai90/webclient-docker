<?php
	//-- 2012.11.07
	//-- return selected rows from search results for  a given search table (as used in foms like search_company, search_address)
	//-- uses primary key with in statement

	//-- if no value then we are clearing list
	$keyValues = $_POST['_kv'];
	if($keyValues=="")$keyValues="-1";

	$strListId = $_POST['lid'];

	//-- get the table primary key name and type
	$tableName = swfc_tablename();

	$parsedKeyValues = "";
	$arrKeyValues = explode(",",$keyValues);
	while (list($pos,$keyValue) = each($arrKeyValues))
	{
		if($parsedKeyValues!="")$parsedKeyValues .= ",";
		$parsedKeyValues .= "'".PrepareForSql($keyValue)."'";
	}

	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() ." where list_id='".PrepareForSql($strListId)."' and value in (" . $parsedKeyValues .")". swfc_orderby();
?>