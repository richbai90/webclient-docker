<?php
	
	//-- global.js sl_load_ci_relations

	checkMandatoryParams("cid"); //-- will exit if mandatory param not found

	$pKey = (parseBool($_POST['blp']))?"FK_CHILD_ID":"FK_PARENT_ID";

	$sqlDatabase = "swdata";
	$sqlCommand = "select PK_AUTO_ID from CONFIG_RELI where " . $pKey . " = " . pfs($_POST['cid']);


	//-- do we have a static filter to apply
	if($_POST["sf"]!="") 
	{
		IncludeApplicationPhpFile("static.sql.php");
		$sqlCommand .= " and " . getStaticSql($_POST["sf"]);
	}

?>