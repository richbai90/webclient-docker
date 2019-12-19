<?php

	//-- server create_ci_relationship - used in global.js oService.prototype.create_ci_relationship

	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();

	if(!$service->create_ci_relationship($_POST['_kv'],$_POST['_bc']))
	{
		//-- throw error
		$service->throwError("The service create_ci_relationship process did not complete properly. Please contact your Administrator.");
	}
	throwSuccess();
?>