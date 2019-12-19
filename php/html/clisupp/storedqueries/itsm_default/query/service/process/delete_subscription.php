<?php
	//-- given cis will delete it and also delete optionally any baselines

	//-- inlcude our cmdb helpers & constants
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();
	if($service->can_update() && $service->can_manage_cost_and_subs())
	{
		$intPrimaryKey = $_POST['key'];
		if(!$service->delete_subscription($intPrimaryKey))
		{
			//-- throw error
			$service->throwError("The service baseline create process did not complete properly. Please contact your Administrator.");
		}
		throwSuccess();
	}
	else
	{
		throwProcessErrorWithMsg("You are not authorised to update services. Please contact your Administrator.");
		exit(0);
	}
?>