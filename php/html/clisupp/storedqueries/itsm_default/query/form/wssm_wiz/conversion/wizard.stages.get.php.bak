<?php
	$strWizID = $_POST['wizid'];
	if(!_validate_url_param($strWizID,"sqlparamstrict")){
		echo generateCustomErrorString("-303","Failed to Process Wizard Stages Query. Possible SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM wssm_wiz_stage WHERE fk_wiz = '".PrepareForSql($strWizID)."' ORDER BY sindex ASC";
