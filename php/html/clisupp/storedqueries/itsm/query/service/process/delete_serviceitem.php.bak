<?php
	//-- given cis will delete it and also delete optionally any baselines

	//-- inlcude our cmdb helpers & constants
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();

	//-- make sure has app rights
	$service->can_delete(true); //-- true param means will exit if current aid does not have right

	$configItemKeys = $_POST['cids'];
	$boolDeleteBaselines = ($_POST['bdb']=="true");

	//-- process ci delete and return final delete result to client
	if(!$service->delete_serviceitem($configItemKeys, $boolDeleteBaselines))
	{
		//-- throw error
		$service->throwError("The service deletion process did not complete properly. Please contact your Administrator.");
	}
	throwSuccess();
?>