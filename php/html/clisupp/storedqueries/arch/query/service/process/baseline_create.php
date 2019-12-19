<?php

	//-- server baseline create - used in global.js oService.prototype.baseline_create

	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();
	if($service->can_manage_baselines()) 
	{
		if(!$service->baseline_create($_POST['cid'],$_POST['ncid']))
		{
			//-- throw error
			$service->throwError("The service baseline create process did not complete properly. Please contact your Administrator.");
		}
		throwSuccess(1);
	}
	else	
	{
		throwProcessErrorWithMsg("You are not authorised to baseline items. Please contact your Administrator.");
		exit(0);
	}
?>