<?php
	$strCallref = $_POST['crf'];
	if(!_validate_url_param($strCallref,"num"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT updatetxt, probcode FROM updatedb,opencall WHERE udindex = 0 AND updatedb.callref = opencall.callref and opencall.callref =". $strCallref ;
?>