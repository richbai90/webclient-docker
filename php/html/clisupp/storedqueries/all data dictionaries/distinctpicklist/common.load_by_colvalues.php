<?php

	//-- will load sql table control using a passed in _swc_<colname>= and supports optional passed in filter


	$parsedFilter = createTableFilterFromParams(swfc_tablename(),swfc_source());

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