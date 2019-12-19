<?php

	//-- global.js cmdb get_me_cis


	$sqlDatabase = "swdata";
	$sqlCommand = "select FK_CI_ID from CONFIG_RELME, CONFIG_ITEMI where FFK_CI_ID = CONFIG_ITEMI.PK_AUTO_ID and FK_ME_KEY in (![mids:sarray]) ";

	//-- do we want to filter by relcode
	if(isset($_POST["rc"])) $sqlCommand .= " and CODE = '![rc]'";

	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$sqlCommand .= " and " . getStaticSql($_POST["sf"]);
	}



?>