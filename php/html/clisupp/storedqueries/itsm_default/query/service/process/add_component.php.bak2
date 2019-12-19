<?php

	//-- service - used in global.js oService.prototype.add_component

	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();

	if($service->can_update())	{
		if(!$service->add_component($_POST['_skv'],$_POST['_ckvs'],$_POST['opt']))	{
			//-- throw error
			$service->throwError("The service add_component process did not complete properly. Please contact your Administrator.");
		}
		throwSuccess();
	} else {
		throwProcessErrorWithMsg("You are not authorised to update services. Please contact your Administrator.");
		exit(0);
	}
?>