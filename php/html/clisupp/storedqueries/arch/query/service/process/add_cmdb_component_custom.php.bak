<?php

	//-- service - used in global.js oService.prototype.add_cmdb_component_custom

	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();

	if($service->can_update())	{
		if(!$service->add_cmdb_component_custom($_POST['_kv'],$_POST['_ckvs']))	{
			//-- throw error
			$service->throwError("The service add_cmdb_component_custom process did not complete properly. Please contact your Administrator.");
		}
		throwSuccess();
	} else {
		throwProcessErrorWithMsg("You are not authorised to update services. Please contact your Administrator.");
		exit(0);
	}
?>