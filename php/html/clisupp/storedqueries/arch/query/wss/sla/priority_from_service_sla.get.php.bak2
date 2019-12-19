<?php
	$intServID = $_POST['sid'];
	$intSLAID = $_POST['slaid'];

	if(	!_validate_url_param($intServID,"num") ||
			!_validate_url_param($intSLAID,"num")){
		echo generateCustomErrorString("-303","Failed to retrieve Priority information. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT priority FROM sc_sla WHERE fk_service =  ".$intServID." AND fk_sla = ".$intSLAID;
