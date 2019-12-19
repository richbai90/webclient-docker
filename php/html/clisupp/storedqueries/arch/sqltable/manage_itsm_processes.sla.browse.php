<?php

	//-- browse table - support static filter param
	if(!HaveRight(ANALYST_RIGHT_C_GROUP,ANALYST_RIGHT_C_CANMANAGESLAS))
	{
		throwError("You do not have permission to manage SLAs.");
		exit;
	}


	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}
	
	$parsedFilter = "";

	//-- add static filter
	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$parsedFilter = " WHERE ". getStaticSql($_POST["sf"]);
	}

	//-- browse training table
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $parsedFilter .  swfc_orderby();

?>