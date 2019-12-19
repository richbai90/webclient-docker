<?php
	$intSLAID = $_POST['slaid'];
	$strImpact = $_POST['impact'];
	$strUrgency = $_POST['urgency'];

	if(	!_validate_url_param($strImpact,"sqlparamstrict") ||
			!_validate_url_param($strUrgency,"sqlparamstrict") ||
			!_validate_url_param($intSLAID,"num") ){
		echo generateCustomErrorString("-303","Failed to retrieve Priority from Matrix information. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}
	$sqlDatabase = "swdata";
	$sqlCommand = "	SELECT fk_priority
									FROM itsmsp_slad_matrix
									WHERE fk_impact =  '".PrepareForSQL($strImpact)."'
									AND fk_urgency =  '".PrepareForSQL($strUrgency)."'
									AND fk_slad = ".$intSLAID."
									AND flg_sla = 1";
