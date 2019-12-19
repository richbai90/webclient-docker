<?php
	$strQId = $_POST['qid'];
	if(!_validate_url_param($strQId,"num"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM qlog_resclose_files WHERE fk_qlog_resclose_details =". $strQId ;
?>