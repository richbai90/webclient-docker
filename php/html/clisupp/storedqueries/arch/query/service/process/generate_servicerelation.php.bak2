<?php

	//-- server baseline create - used in global.js oService.prototype.baseline_create

	$strKey= $_POST["key"];
	$ciKeys= $_POST["cids"];
	$boolinCIisParent=$_POST["bp"];
	$ynOperational = $_POST["ope"];
	$boolOptional = $_POST["opt"];
	$strDependancy = $_POST["dep"];
	
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();
	if($service->can_update())
	{
		if(!$service->generate_servicerelation($strKey,$ciKeys,$boolinCIisParent,$ynOperational,$boolOptional,$strDependancy))
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