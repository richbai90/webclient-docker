<?php
	//-- 2012.11.07
	//-- return selected rows from search results for  a given search table (as used in foms like search_company, search_address)
	//-- uses primary key with in statement

	if(!HaveRight(ANALYST_RIGHT_C_GROUP,ANALYST_RIGHT_C_CANMANAGESLAS))
	{
		throwError("You do not have permission to manage SLAs.");
		exit;
	}

	//-- if no value then we are clearing list
	$keyValues = $_POST['kv'];
	$strWhere = "";
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
	if($parsedKeyValues!="")
	{
		$strWhere = " where priority NOT IN (" . $parsedKeyValues . ")";
	}

	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() .$strWhere .swfc_orderby();
?>