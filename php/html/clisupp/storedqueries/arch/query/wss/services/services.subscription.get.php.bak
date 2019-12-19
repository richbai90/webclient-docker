<?php
	$intSubsID = trim($_POST['subid']);
 	if(!_validate_url_param($intSubsID,"num")){
		echo generateCustomErrorString("-303","Failed to retrieve Service Subscription Information. SQL Injection Detected. Please contact your Administrator.".$intSubsID);
		exit(0);
	}

	//Execute SQL
	$sqlDatabase = "swdata";
	$sqlCommand = "	SELECT *
									FROM sc_subscription
									WHERE pk_id = ".$intSubsID;
