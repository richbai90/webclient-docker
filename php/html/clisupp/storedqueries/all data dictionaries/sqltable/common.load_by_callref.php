<?php

	//-- will load sql table control using callref in () and supports optional passed in filter


	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}


	checkMandatoryParams("crs"); //-- will exit if mandatory param not found

	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable(). " where CALLREF in (" . pfs($_POST['crs']) . ")";


	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$sqlCommand .= " and " . getStaticSql($_POST["sf"]);
	}

	$sqlCommand .= swfc_orderby();
?>