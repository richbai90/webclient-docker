<?php

	//-- loop passed in columns for table and create insert statement
	//-- 
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();
	if($service->can_update() && $service->can_manage_cost_and_subs())	{
		$sqlDatabase = "swdata";
		$arc = createTableInsertFromParamsXMLMC(PrepareForSql('sc_sla'),$sqlDatabase);
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