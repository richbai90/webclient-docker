<?php
	$strName = $_POST["name"];
	if(!_validate_url_param($strName,"sqlparamstrict") || $strName=="" )
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = "select * from ONHOLD_NOTIFIERS where ONHOLD_PERIOD = '". PrepareForSql($strName) ."'";
?>