<?php

	if(!HaveAppRight("A", 9, $session->currentDataDictionary)){
		echo generateCustomErrorString("101", "You do not have the correct permissions to restore wizard backups!");
		exit(0);
	}

	$intQuestionID = $_POST['qid'];
	$strRestoreColumn = $_POST['column'];
	if(	!_validate_url_param($strRestoreColumn,"sqlparamstrict") ||
			!_validate_url_param($intQuestionID,"num") ){
		echo generateCustomErrorString("-303","Failed to restore Wizard Question from backup. Possible SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "swdata";
	$sqlCommand = " UPDATE wssm_wiz_q SET ".$strRestoreColumn." = (SELECT ".$strRestoreColumn." FROM wssm_wiz_q_backup WHERE wssm_wiz_q_backup.pk_qid = ".$intQuestionID.")
 									WHERE pk_qid = ".$intQuestionID;
