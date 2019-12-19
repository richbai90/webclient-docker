<?php

	//-- global.js cmdb create_ci

	IncludeApplicationPhpFile("cmdb.helpers.php");
	$cmdb = new cmdbFunctions();

	//-- can create cmdb
	if(!$cmdb->can_create())
	{
		$cmdb->throwError("You are not authorised to create Configuration Items.\nIf you require authorisation please contact your Supportworks Administrator.");
	}else
	{
		if($cmdb->create_ci($_POST['cit'],$_POST['noc']))
		{
			throwSuccess(1);
		}
		else
		{
			throwProcessErrorWithMsg("CMDB process create_ci did not complete properly. Please contact your Administrator"); //-- so submit will treat as error and alert out.
		}
	}
?>