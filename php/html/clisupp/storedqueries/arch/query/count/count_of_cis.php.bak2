<?php

	//-- will load picklist control control using pk_auto_id in () and supprots optional passed in filter

	$sqlDatabase = "swdata";
	$sqlCommand = "Select count(*) as cnt from CONFIG_ITEMI where PK_AUTO_ID in (![pids:array])";


	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$sqlCommand .= " and " . getStaticSql($_POST["sf"]);
	}

	$sqlCommand .= swfc_orderby();
?>