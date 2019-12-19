<?php
	$intCallref = $_POST["crfs"];
	if(!_validate_url_param($intCallref,"csnum"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT count(*) AS reccount FROM opencall WHERE callref IN (". $intCallref .") AND slaresp = 0";
?>