<?php

	//-- copy ci relations to another ci - global.js copy_relations function
	$intCopyFromCIKey = PrepareForSql($_POST['intCopyFromCIKey']);
	$intCopyToCIkey = PrepareForSql($_POST['intCopyToCIkey']);

	IncludeApplicationPhpFile("cmdb.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$cmdb = new cmdbFunctions();

	if(!$cmdb->copy_relations($_POST['intCopyFromCIKey'],$_POST['intCopyToCIkey']))
	{
		throwError(-101,"Failed to copy configuration item relationships. Please contact your Administrator"); //-- fail and exit
	}
	throwSuccess(0); //-- ok and exit

?>