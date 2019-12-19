<?php
	$strQId = $_POST['qid'];
	if(!_validate_url_param($strQId,"num"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	
	$sqlDatabase = "swdata";
	//$sqlCommand = "SELECT * FROM qlog_resclose_details WHERE qlog_resclose_details.pk_auto_id =". $strQId ;
	$sqlCommand = "SELECT d.*, f.filename FROM qlog_resclose_details as d ";
	$sqlCommand .= "LEFT JOIN qlog_resclose_files as f on f.fk_qlog_resclose_details = d.pk_auto_id ";
	$sqlCommand .= "WHERE d.pk_auto_id = " . $strQId;
?>