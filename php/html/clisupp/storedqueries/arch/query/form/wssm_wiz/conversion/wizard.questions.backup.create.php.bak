<?php
	if(!HaveAppRight("A", 9, $session->currentDataDictionary)){
		echo generateCustomErrorString("101", "You do not have the correct permissions to create wizard question backups!");
		exit(0);
	}
	$sqlDatabase = "swdata";
	$sqlCommand = " INSERT INTO wssm_wiz_q_backup
									( pk_qid, defaultvalue, filter, sec_filter )
									SELECT pk_qid, defaultvalue, filter, sec_filter FROM wssm_wiz_q; ";
