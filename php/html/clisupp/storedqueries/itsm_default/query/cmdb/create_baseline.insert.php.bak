<?php

	//-- loop passed in columns for table and create insert statement
	//-- 
	$boolOK = false;
	if($_POST['_swc_ck_config_type']=='ME->Service'){
		IncludeApplicationPhpFile("service.helpers.php");
		$service = new serviceFunctions();
		$boolOK = $service->can_manage_baselines();
	} else {
		IncludeApplicationPhpFile("cmdb.helpers.php");
		$cmdb = new cmdbFunctions();
		$boolOK = $cmdb->can_baseline();
	}
	if($boolOK )	{
		$sqlDatabase = "swdata";
		$sqlCommand = createTableInsertFromParams(PrepareForSql('config_itemi'),$sqlDatabase);
	}	else	{
		throwProcessErrorWithMsg("You are not authorised to baseline items. Please contact your Administrator.");
		exit(0);
	}
?>