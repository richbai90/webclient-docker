<?php

	//-- global.js cmdb copy_parenttype_relationtypes

	IncludeApplicationPhpFile("cmdb.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$cmdb = new cmdbFunctions();

	if($cmdb->copy_parenttype_sc_relationtypes($_POST['tid'],$_POST['ptid']))
	{
		throwSuccess(1);
	}
	else
	{
		throwProcessErrorWithMsg("CMDB process copy_parenttype_sc_relationtypes did not complete properly. Please contact your Administrator"); //-- so submit will treat as error and alert out.
	}

?>