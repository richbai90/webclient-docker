<?php
	$intSubsID = $_POST['sid'];
	$intSLAID = $_POST['slaid'];

	if(	!_validate_url_param($intSubsID,"num") ||
			!_validate_url_param($intSLAID,"num") ){
		echo generateCustomErrorString("-303","Failed to retrieve Priority information. Possible SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "swdata";
	/*$sqlCommand = "SELECT fk_priority
									FROM sc_subscription, itsmsp_slad
									WHERE pk_id = ".$intSubsID."
									AND sc_subscription.fk_default_sla = itsmsp_slad.pk_slad_id";*/

	$sqlCommand = "SELECT priority FROM sc_sla WHERE fk_subscription =  ".$intSubsID." AND fk_sla = ".$intSLAID;
