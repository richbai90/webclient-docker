<?php

	//-- will load sql table control using just a static filter


	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}


	checkMandatoryParams("sf"); //-- will exit if mandatory param not found

	IncludeApplicationPhpFile("static.sql.php");

	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable();
	$sqlCommand .= " WHERE " . getStaticSql($_POST["sf"]);
	$sqlCommand .= swfc_orderby();
?>