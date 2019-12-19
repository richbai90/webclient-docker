<?php
	
	//-- global.js cmdb get_call_cis
	//--TK SQL Optimisation
	if($_POST['crs'] == 0)
	{
		throwSuccess();
	}
	
	$sqlDatabase = "swdata";
	$sqlCommand = "select FK_CI_AUTO_ID from CMN_REL_OPENCALL_CI where FK_CALLREF in (![crs:array]) ";

	//-- do we want to filter by relcode
	if(isset($_POST["rc"])) $sqlCommand .= " and RELCODE = '![rc]'";

	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$sqlCommand .= " and " . getStaticSql($_POST["sf"]);
	}

?>