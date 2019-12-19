<?php

	//-- loop passed in columns for table and create update statement for given record key
	//-- 
	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();
	if($service->can_update() && $service->can_manage_cost_and_subs())	{
		$sqlDatabase = "swdata";
		if($_POST['cdb']=="1")	{
			$sqlDatabase = "sw_systemdb";
		}
		$sqlCommand = createTableUpdateFromParams('sc_subscription',$_POST['kv'],$sqlDatabase);
	}	else {
		throwProcessErrorWithMsg("You are not authorised to update services. Please contact your Administrator.");
		exit(0);
	}
?>