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
	//Added the proper form to the SQL Inyection
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strSettingID,"sqlparamstrict") : false);

	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$strDefaultSettingID = $strSettingID.".default";
	//Get Default setting record
	$strSQL  = "SELECT wss_config FROM wssm_admin WHERE wss_instance_id = '".PrepareForSql($strInstanceID)."' AND wss_config_id = '".PrepareForSql($strDefaultSettingID)."'";
	$aRS = get_recordset($strSQL, 'swdata');
	if($aRS->result==false) {
		echo generateCustomErrorString("-303","Failed to retrieve Configuration record. Please contact your Administrator.");
		exit(0);
	}
	if($aRS->Fetch()) {
		$strDefaultSetting  = $aRS->GetValueAsString("wss_config");
		//Execute SQL
		if($strDefaultSetting != ""){
			$sqlDatabase = "swdata";
			$sqlCommand = "UPDATE wssm_admin SET wss_config = '".PrepareForSQL($strDefaultSetting)."' WHERE wss_instance_id = '".PrepareForSql($strInstanceID)."' AND wss_config_id = '".PrepareForSql($strSettingID)."'";
		} else {
			echo generateCustomErrorString("-303","Failed to update Configuration record. Please contact your Administrator.");
			exit(0);
		}
	} else {
		echo generateCustomErrorString("-303","Failed to retrieve Configuration record. Please contact your Administrator.");
		exit(0);
	}
