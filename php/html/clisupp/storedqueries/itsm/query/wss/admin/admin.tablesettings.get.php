<?php
	$strInstanceID = $session->analystId;
	$boolNoSQLInjection = true;
	$strSettingID = $_POST['settingid'];


	//Added the proper form to the SQL Inyection
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strSettingID,"sqlparamstrict") : false);

	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "swdata";
	$sqlCommand = "select wss_config from wssm_admin where wss_instance_id =  '".PrepareForSQL($strInstanceID)."' AND wss_config_id = '".$strSettingID."'";
