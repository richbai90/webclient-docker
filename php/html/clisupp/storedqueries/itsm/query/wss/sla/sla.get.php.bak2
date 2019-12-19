<?php
	//-- Check Rights
	$strPriorityID = $_POST['priority'];

	if(!_validate_url_param($strPriorityID,"sqlparamstrict")){
		echo generateCustomErrorString("-303","Failed to retrieve SLA information. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT fk_slad, fk_slad_name FROM itsmsp_slad_priority WHERE fk_priority =  '".PrepareForSQL($strPriorityID)."' AND flg_sla = 1";
