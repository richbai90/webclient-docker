<?php
	$intCallref = $_POST["crf"];
	if(!_validate_url_param($intCallref,"num"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT priority,fixby,itsm_sladef FROM opencall WHERE opencall.callref =".PrepareForSql($intCallref);
?>