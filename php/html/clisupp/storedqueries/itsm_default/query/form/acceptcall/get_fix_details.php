<?php
	$intCallref = $_POST["crf"];
	if(!_validate_url_param($intCallref,"num"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT opencall_sla.fixby, opencall_sla.fix_ctr, opencall.status FROM opencall_sla JOIN opencall ON opencall.callref = opencall_sla.callref WHERE opencall_sla.callref in (![crf:array]) ORDER BY fix_ctr desc";
?>