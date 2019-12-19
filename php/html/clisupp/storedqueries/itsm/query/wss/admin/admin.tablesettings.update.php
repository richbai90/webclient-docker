<?php

	//-- Check Rights
	$intCustWebflag = $session->selfServiceWebFlags;
	if((OPTION_ADMIN & $intCustWebflag) == 0) {
		echo generateCustomErrorString("-303","You do not have the required permissions to manage this table.");
		exit(0);
	}
	$strInstanceID = $session->analystId;
	$boolNoSQLInjection = true;
	$strSettingID = $_POST['settingid'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strSettingID,"sqlparamstrict") : false);
	$strSettings = $_POST['settings'];
	$strSettings = base64_decode($strSettings);
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strSettings,"sqlparamstrict") : false);

	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	//Execute SQL
	$sqlDatabase = "swdata";
	$sqlCommand = "UPDATE wssm_admin SET wss_config = '".PrepareForSQL($strSettings)."' WHERE wss_instance_id = '".PrepareForSql($strInstanceID)."' AND wss_config_id = '".PrepareForSql($strSettingID)."'";
