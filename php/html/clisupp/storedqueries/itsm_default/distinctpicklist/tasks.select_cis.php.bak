<?php

	//-- will load picklist control control using pk_auto_id in () and supprots optional passed in filter

	checkMandatoryParams("pids"); //-- will exit if mandatory param not found

	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable(). " where PK_AUTO_ID in (" . pfs($_POST['pids']) . ")";


	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$sqlCommand .= " and " . getStaticSql($_POST["sf"]);
	}

	$sqlCommand .= swfc_orderby();
?>