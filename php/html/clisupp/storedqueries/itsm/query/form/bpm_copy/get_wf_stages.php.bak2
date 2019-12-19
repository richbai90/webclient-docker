<?php
	$strWorkflow = $_POST["wf"];
	if(!_validate_url_param($strWorkflow,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	$parsedFilter = "fk_workflow_id='".PrepareForSql($strWorkflow)."'";

	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;

	$sqlDatabase = "swdata";
	$sqlCommand = "select * from bpm_stage ".$parsedFilter;
?>