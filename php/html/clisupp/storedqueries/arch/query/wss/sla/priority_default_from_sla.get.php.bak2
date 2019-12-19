<?php
	$intSLAID = $_POST['slaid'];

	if(!_validate_url_param($intSLAID,"num")){
		echo generateCustomErrorString("-303","Failed to retrieve SLA Default Priority information. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT fk_ssla AS priority FROM itsmsp_slad WHERE pk_slad_id = ".$intSLAID;
