<?php
	$intConditionId = $_POST["cid"];
	if(!_validate_url_param($intConditionId,"num"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	$parsedFilter = "fk_cond_id=".PrepareForSql($intConditionId);

	//-- if we have a filter then and the where
	if($parsedFilter!="") 
		$parsedFilter = " where " . $parsedFilter;
	else
	{
		throwProcessErrorWithMsg("No parameters specified. Please contact your Administrator.");
		exit(0);
	}

	$sqlDatabase = "swdata";
	$sqlCommand = "select * from bpm_cond_vpme ".$parsedFilter;
?>