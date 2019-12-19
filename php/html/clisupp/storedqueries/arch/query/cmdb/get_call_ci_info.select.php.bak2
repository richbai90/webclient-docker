<?php
	
	//-- global.js get_call_ci_info

	$sqlDatabase = "swdata";
	$sqlCommand = "select FK_CI_AUTO_ID, CK_CONFIG_ITEM, CK_CONFIG_TYPE from CMN_REL_OPENCALL_CI, CONFIG_ITEMI where FK_CALLREF in (![crs:array]) and FK_CI_AUTO_ID = CONFIG_ITEMI.PK_AUTO_ID";

	//-- do we want to filter by relcode
	if(isset($_POST["rc"])) $sqlCommand .= " and RELCODE = '" .pfs($_POST["rc"]). "'";

	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$sqlCommand .= " and " . getStaticSql($_POST["sf"]);
	}

?>