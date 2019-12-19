<?php
	$strPriority = $_POST["priority"];
	if(!_validate_url_param($strPriority,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT * FROM contract WHERE fk_priority = '" . PrepareForSql($strPriority)."'";
?>