<?php
	//-- Check Rights
	$strWizardId = $_POST['wizardname'];

	if(!_validate_url_param($strWizardId,"sqlparamstrict")){
		echo generateCustomErrorString("-303","Failed to retrieve Wizard Information. SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM wssm_wiz WHERE pk_name =  '".PrepareForSQL($strWizardId)."'";
?>
