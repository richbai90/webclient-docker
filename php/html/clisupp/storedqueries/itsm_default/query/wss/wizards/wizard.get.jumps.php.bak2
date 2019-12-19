<?php
	$intQID = $_POST['qid'];
	if(!_validate_url_param($intQID,"num")){
		echo generateCustomErrorString("-303","Failed to retrieve Wizard Jump Information. SQL Injection Detected. Please contact your Administrator.".$intWizardStage);
		exit(0);
	}
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT wssm_wiz_qac.*, wssm_wiz_stage.sindex FROM wssm_wiz_qac LEFT JOIN wssm_wiz_stage ON wssm_wiz_qac.fk_nextstage = wssm_wiz_stage.pk_auto_id WHERE wssm_wiz_qac.fk_qid = ".$intQID;
?>
