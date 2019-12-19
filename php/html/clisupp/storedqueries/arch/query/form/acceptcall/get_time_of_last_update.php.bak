<?php
	$intCallref = $_POST["crfs"];
	if(!_validate_url_param($intCallref,"csnum"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT max(updatetimex) AS dtthemaxtime FROM updatedb WHERE callref IN (![crfs:array])";
?>