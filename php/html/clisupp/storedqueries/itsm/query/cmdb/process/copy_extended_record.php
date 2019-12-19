<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$cmdb = new cmdbFunctions();


	if($cmdb->copy_extended_record($_POST['intCopyFromCIKey'], $_POST['intCopyToCIkey'], $_POST['strConfigType']))
	{
		throwSuccess(1);
	}
	else
	{
		throwSuccess(-2); //-- so submit will treat as error but not alert out.
	}
?>