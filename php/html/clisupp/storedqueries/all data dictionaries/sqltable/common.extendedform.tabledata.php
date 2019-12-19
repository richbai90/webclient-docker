<?php
	//-- 2012.11.07
	//-- return selected rows from search results for  a given search table (as used in foms like search_company, search_address)
	//-- uses primary key with in statement

	//-- if no value then we are clearing list
	$keyValues = $_POST['_kv'];
	if($keyValues=="")
	{
			$keyValues = $_POST['kvs'];
	}
	if($keyValues=="")$keyValues="-1";

	//-- get the table primary key name and type
	$tableName = swfc_tablename();
	$primaryKeyColumn = getTablePrimaryKeyName($tableName);
	$bNumeric = isColNumeric($tableName,$primaryKeyColumn);
	$strQuote = ($bNumeric)?"":"'";

	$parsedKeyValues = "";
	$arrKeyValues = explode(",",$keyValues);
	while (list($pos,$keyValue) = each($arrKeyValues))
	{
		if($parsedKeyValues!="")$parsedKeyValues .= ",";
		$parsedKeyValues .= $strQuote.PrepareForSql($keyValue).$strQuote;
	}

	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() ." where ". $primaryKeyColumn ." in (" . $parsedKeyValues .")". swfc_orderby();
?>