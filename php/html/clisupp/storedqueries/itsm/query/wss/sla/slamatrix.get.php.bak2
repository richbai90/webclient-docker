<?php
	//-- Check Rights
	$strPriorityID = $_POST['priority'];
	$intSLAID = $_POST['slaid'];

	if(	!_validate_url_param($strPriorityID,"sqlparamstrict") ||
			!_validate_url_param($intSLAID,"num") ){
		echo generateCustomErrorString("-303","Failed to retrieve SLA information. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}
	$sqlDatabase = "swdata";
	$sqlCommand = "	SELECT fk_urgency, fk_impact
									FROM itsmsp_slad_matrix
									WHERE fk_priority =  '".PrepareForSQL($strPriorityID)."'
									AND fk_slad = ".$intSLAID."
									AND flg_sla = 1";
