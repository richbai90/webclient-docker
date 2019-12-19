<?php
	//----- SQL Injection & session checks
	$intDataFormID = trim($_POST['dfid']);
 	if(!_validate_url_param($intDataFormID,"num")){
		echo generateCustomErrorString("-303","Failed to retrieve Service DataForm. SQL Injection Detected. Please contact your Administrator.".$intDataFormID);
		exit(0);
	}

	//Execute SQL
	$sqlDatabase = "swdata";
	$sqlCommand = "	SELECT *
									FROM sc_dataform
									WHERE pk_auto_id = ".$intDataFormID;
