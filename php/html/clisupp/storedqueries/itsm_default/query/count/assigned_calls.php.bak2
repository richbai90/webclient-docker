<?php
	if(isset($_POST["aid"]))
	{
		$strAnalystID = $_POST["aid"];
		if(!_validate_url_param($strAnalystID,"sqlparamstrict"))
		{
			throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
			exit(0);
		}
	}
	else
	{
		$strAnalystID = $session->analyst->AnalystID;
	}

	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "select count(*) as cnt from opencall where status < 16 AND status != 6 and owner = '". PrepareForSql($strAnalystID) ."'";
?>