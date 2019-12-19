<?php

	//-- used in global.js cmdb get_me_cis
	//-- return ci key values for passed in owners

	$sqlDatabase = "swdata";
	$sqlCommand = "select PK_AUTO_ID from CONFIG_ITEMI where FK_USERDB in (![mids:sarray]) and ISACTIVEBASELINE = 'YES'";
	
	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$sqlCommand .= " AND " . getStaticSql($_POST["sf"]);
	}
?>