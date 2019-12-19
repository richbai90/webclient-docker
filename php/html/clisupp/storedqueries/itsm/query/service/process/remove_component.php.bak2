<?php

	//-- server baseline create - used in global.js oService.prototype.baseline_reactive

	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();

	if($service->can_update()){
		if(!$service->remove_component($_POST['_kvs']))	{
			//-- throw error
			$service->throwError("The service remove_component process did not complete properly. Please contact your Administrator.");
		}
		throwSuccess();
	}else{
		throwProcessErrorWithMsg("You are not authorised to update services. Please contact your Administrator.");
		exit(0);
	}
?>