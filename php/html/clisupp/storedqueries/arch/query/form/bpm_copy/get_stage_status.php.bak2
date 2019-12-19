<?php
	$intStageId = $_POST["sid"];
	if(!_validate_url_param($intStageId,"num"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	$parsedFilter = "fk_stage_id=".PrepareForSql($intStageId);

	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;

	$sqlDatabase = "swdata";
	$sqlCommand = "select * from bpm_stage_sts ".$parsedFilter;
?>