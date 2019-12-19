<?php

	//-- loop passed in columns for table and create insert statement
	//-- 
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();
	if($service->can_update() && $service->can_manage_cost_and_subs())	{
		if($_POST['cdb']=="1")	{
			$sqlDatabase = "sw_systemdb";
			$sqlCommand = createTableInsertFromParams(PrepareForSql('sc_subscription'),$sqlDatabase);
		}
		else
		{
			$sqlDatabase = "swdata";
			$arc = createTableInsertFromParamsXMLMC(PrepareForSql('sc_subscription'),$sqlDatabase);
			if(1==$arc)
			{
				throwSuccess();
			}
			else
			{
				throwError(100,$arc);
			}
		}
	}
	else
	{
		throwProcessErrorWithMsg("You are not authorised to update services. Please contact your Administrator.");
		exit(0);
	}
?>