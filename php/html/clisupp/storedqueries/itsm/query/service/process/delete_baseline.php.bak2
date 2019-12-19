<?php
	//-- given cis will delete it and also delete optionally any baselines

	//-- inlcude our cmdb helpers & constants
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();

	//-- make sure has app rights
	$service->can_manage_baselines(true); //-- true param means will exit if current aid does not have right

	$configItemKeys = $_POST['cids'];
	
	//-- process ci delete and return final delete result to client
	if(!$service->delete_serviceitem($configItemKeys, false))
	{
		//-- throw error
		$service->throwError("The service deletion process did not complete properly. Please contact your Administrator.");
	}
	throwSuccess();
?>