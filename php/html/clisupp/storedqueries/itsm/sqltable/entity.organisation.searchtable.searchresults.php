<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)
	
	//-- Get Post Values
	$boolPaged = $_POST['paged'];
	$intPageNo = $_POST['start'];
	$webclient = $_POST['webclient']; //-- Is Called By Webclient
	
	if(!isset($_POST['paged']) ||$_POST['start']=="")
	{
		throwSuccess();
	}
	//-- Include Paging Specific Helpers File
	IncludeApplicationPhpFile("paging.helpers.php");

	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}

	//-- loop passed in columns for specific table - check valid sqlobjectnames and create filter
	$parsedFilter = createTableFilterFromParams(swfc_tablename());

	//-- Pass Filter to Paging Functions
	$strPagedQuery = sql_page($parsedFilter, $intPageNo, swfc_selectcolumns(), swfc_fromtable(), swfc_orderby());
	
	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;

	//-- add static filter
	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$parsedFilter .= ($parsedFilter=="")? " WHERE " : " AND ";
		$parsedFilter .= getStaticSql($_POST["sf"]);
	}

		
	if($strPagedQuery)
	{
		$sqlCommand = $strPagedQuery;
	}else
	{
		$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $parsedFilter . swfc_orderby();
	}
	$sqlDatabase = "swdata";
	

?>