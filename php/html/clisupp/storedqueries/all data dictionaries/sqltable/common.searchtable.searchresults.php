<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)

	$and = $_POST['_and'];
	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}

	//-- loop passed in columns for specific table - check valid sqlobjectnames and create filter
	$parsedFilter = createTableFilterFromParams(swfc_tablename());

	//-- if we have a filter then and the where
	if($and=="false")
	{
		if(!isset($_POST["sf"]))
		{
			if($parsedFilter!="") $parsedFilter = " where (" . $parsedFilter . ")";
		}else
		{
			if($parsedFilter!="") $parsedFilter = " where (" . $parsedFilter;
		}
	}else
	{
		if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;
	}
	

	//-- add static filter
	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		if($and=="false")
		{
			$parsedFilter .= ($parsedFilter=="")? " WHERE " : ") AND ";
			$parsedFilter .= getStaticSql($_POST["sf"]);

		}else
		{
			$parsedFilter .= ($parsedFilter=="")? " WHERE " : " AND ";
			$parsedFilter .= getStaticSql($_POST["sf"]);

		}
		
	}


	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $parsedFilter . swfc_orderby();

?>