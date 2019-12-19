<?php
	$strCallref = $_POST['crf'];
	if(!_validate_url_param($strCallref,"num"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT custom_i3 FROM opencall WHERE opencall.callref =". $strCallref ;
?>