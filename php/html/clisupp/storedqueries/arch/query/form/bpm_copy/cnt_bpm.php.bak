<?php
	$strWorkflow = $_POST["wf"];
	if(!_validate_url_param($strWorkflow,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	$parsedFilter = "pk_workflow_id='".PrepareForSql($strWorkflow)."'";
	// perform appcode filtering server side
	$strAppcodes = getAppcodeFilter("FILTER.APPCODE.BPM");

	if($strAppcodes!="")
	{
		if($parsedFilter!="") 
			$parsedFilter = " appcode in (".$strAppcodes.") and " . $parsedFilter;
		else
			$parsedFilter = " appcode in (".$strAppcodes.") " . $parsedFilter;
	}

	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;

	$sqlDatabase = "swdata";
	$sqlCommand = "select count(*) as cnt from bpm_workflow ".$parsedFilter. swfc_orderby();
?>