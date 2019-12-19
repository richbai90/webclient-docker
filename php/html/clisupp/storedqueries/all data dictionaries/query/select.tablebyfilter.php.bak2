<?php

	//-- select a passed in table using passed in cols as where clause
	//-- this assumes sql api will enforce table select permissions

	//-- add static filter
	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$parsedFilter = " WHERE " . getStaticSql($_POST["sf"]);
	}

	//--
	$sqlDatabase = "swdata";
	if($_POST['cdb']=="1")	$sqlDatabase = "sw_systemdb";
	$sqlCommand =  "select * from " .swfc_tablename() . $parsedFilter;

?>