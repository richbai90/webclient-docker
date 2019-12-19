<?php


	$sqlDatabase = "swdata";
	$sqlCommand = "Select count(*) as cnt from OPENCALL where BPM_PARENTCALLREF = ![cr:numeric] and BPM_STAGE_ID = ![sid:numeric] and BPM_TASK_TITLE = ':[title:sqlparamstrict]'";


	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$sqlCommand .= " and " . getStaticSql($_POST["sf"]);
	}
?>