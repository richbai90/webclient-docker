<?php

	$filter = $_POST["filter"];
	//-- if we have a filter then and the where
	if($filter!="") $filter = " where " . $filter;


	//-- add static filter
	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$parsedFilter .= ($parsedFilter=="")? " WHERE " : " AND ";
		$parsedFilter .= getStaticSql($_POST["sf"]);
	}
	
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc__selectcolumns_dr() . swfc_fromtable() .$filter. swfc_orderby();
?>