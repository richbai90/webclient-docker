<?php
	$intStageID = $_POST['stageid'];
	if(!_validate_url_param($intStageID,"num")){
		echo generateCustomErrorString("-303","Failed to Process Wizard Stages Query. Possible SQL Injection Detected. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "swdata";
	$sqlCommand = "	SELECT q.*, qb.defaultvalue AS b_defaultvalue, qb.filter AS b_filter, qb.sec_filter AS b_sec_filter
									FROM wssm_wiz_q q
									LEFT JOIN wssm_wiz_q_backup qb ON q.pk_qid = qb.pk_qid
									WHERE q.fk_wiz_stage = ".$intStageID." ORDER BY q.qindex ASC";
