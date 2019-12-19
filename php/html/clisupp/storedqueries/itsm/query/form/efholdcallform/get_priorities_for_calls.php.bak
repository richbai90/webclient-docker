<?php
	$intCallrefs = $_POST["crfs"];
	if(!_validate_url_param($intCallrefs,"csnum") || $intCallrefs=="" )
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	//-- command
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT callref, priority FROM opencall WHERE callref IN (" . $intCallrefs.")";
?>