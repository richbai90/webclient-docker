<?php

	//-- server baseline create - used in global.js oService.prototype.baseline_reactive

	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();

	if(!$service->baseline_reactive($_POST['cid'],$_POST['ncid']))
	{
		//-- throw error
		$service->throwError("The service baseline reactivate process did not complete properly. Please contact your Administrator.");
	}
	throwSuccess();
?>