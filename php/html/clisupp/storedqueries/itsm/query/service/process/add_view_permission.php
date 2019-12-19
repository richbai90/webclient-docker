<?php

	//-- server service view permission create - used in global.js oService.prototype.add_view_permission

	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();

	if($service->can_update() && $service->can_manage_cost_and_subs()){
		$res = $service->add_view_permission($_POST['type'],$_POST['sid'],$_POST['keys']);
		if($res===false)
		{
			//-- throw error
			$service->throwError("The service add_view_permission process did not complete properly. Please contact your Administrator.");
		}
		throwSuccess();
	}else{
		throwProcessErrorWithMsg("You are not authorised to update services. Please contact your Administrator.");
		exit(0);
	}
?>