<?php

	//-- global.js cmdb clone_relations

	IncludeApplicationPhpFile("cmdb.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$cmdb = new cmdbFunctions();

	//-- copy ci relations to another ci - global.js copy_relations function
	$intCopyFromCIKey = $_POST['intCopyFromCIKey'];
	$intCopyToCIkey = $_POST['intCopyToCIkey'];
	$strCK_CONFIG_ITEM = $_POST['strCK_CONFIG_ITEM'];


	if($cmdb->clone_relations($intCopyFromCIKey, $intCopyToCIkey, $strCK_CONFIG_ITEM))
	{
		throwSuccess(0);
	}
	else
	{
		$cmdb->throwError("Failed to clone configuration item relationships. Please contact your Administrator"); 
	}

?>