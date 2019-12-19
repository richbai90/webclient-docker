<?php
	if(!HaveAppRight("A", 9, $session->currentDataDictionary)){
		echo generateCustomErrorString("101", "You do not have the correct permissions to access this page!");
		exit(0);
	}
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM wssm_wiz ORDER BY title";
