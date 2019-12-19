<?php
	//-- Check Rights
	$intWizardStage = $_POST['stage'];
	if(!_validate_url_param($intWizardStage,"num")){
		echo generateCustomErrorString("-303","Failed to retrieve Wizard Stage Information. SQL Injection Detected. Please contact your Administrator.".$intWizardStage);
		exit(0);
	}
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM wssm_wiz_q WHERE fk_wiz_stage = ".$intWizardStage." ORDER BY qindex ASC";
?>
