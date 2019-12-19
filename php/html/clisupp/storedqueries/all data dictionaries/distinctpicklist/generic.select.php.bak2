<?php 
	//-- 2012.11.07
	//-- return data from swdata.swlist with passed in list id to be used within filter filter

	//-- create filter using value = (false property at the end)
	$parsedFilter = createPicklistFilterFromParams(swfc_tablename(),swfc_source(),"_swc_",false);

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

	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() .$parsedFilter. swfc_orderby();
?>