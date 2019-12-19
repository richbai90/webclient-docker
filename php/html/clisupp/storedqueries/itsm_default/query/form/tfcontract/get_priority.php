<?php
	$strPriority = $_POST["name"];
	if(!_validate_url_param($strPriority,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	//-- command
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT * FROM SYSTEM_SLA WHERE NAME = '" . PrepareForSql($strPriority)."'";
?>