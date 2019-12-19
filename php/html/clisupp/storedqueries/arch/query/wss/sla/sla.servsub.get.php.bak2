<?php
	//-- Check Rights
	$intID = $_POST['sid'];
	$strSLAType = $_POST['slatype'];

	if(	!_validate_url_param($strSLAType,"sqlparamstrict") ||
			!_validate_url_param($intID,"num")){
		echo generateCustomErrorString("-303","Failed to retrieve SLA information. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$strKeyCol = "";
	if ($strSLAType == "SERV"){
		$strKeyCol = "fk_service";
	} else if ($strSLAType == "SUBS") {
		$strKeyCol = "fk_subscription";
	} else {
		echo generateCustomErrorString("-101", "SLA Type must be Service or Subscription.");
	}
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM sc_sla WHERE ".$strKeyCol." =  ".$intID."";
