<?php
	//-- given cis will delete it and also delete optionally any baselines

	//-- inlcude our cmdb helpers & constants
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();
	if($service->can_update() && $service->can_manage_cost_and_subs()) {
		$intPrimaryKey = $_POST['key'];
		
		$arc = xmlmc_deleteRecord("SC_SUBSCRIPTION",pfs($intPrimaryKey));
		if(0==$arc)	{
			//-- throw error
			$service->throwError("The service cost was unable to be deleted. Please contact your Administrator.");
		}
		throwSuccess();
	} else {
		throwProcessErrorWithMsg("You are not authorised to update services. Please contact your Administrator.");
		exit(0);
	}
?>