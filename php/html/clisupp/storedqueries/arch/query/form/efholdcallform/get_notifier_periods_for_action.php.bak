<?php
	$strName = $_POST["atype"];
	if(!_validate_url_param($strName,"sqlparamstrict") || $strName=="" )
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = "select * from onhold_periods where action_type = '". PrepareForSql($strName) ."'";
?>