<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();

	if($service->can_update() && $service->can_manage_cost_and_subs()){
		$strKey= PrepareForSql($_POST['key']);

		
		$strTable = "SC_TARGET";
		$arc = xmlmc_deleteRecord($strTable,$strKey);
		if(1==$arc)
		{
			throwSuccess();
		}
		else
		{
			throwError(100,$arc);
		}
	}
	else
	{
		throwProcessErrorWithMsg("You are not authorised to update services. Please contact your Administrator.");
		exit(0);
	}
?>