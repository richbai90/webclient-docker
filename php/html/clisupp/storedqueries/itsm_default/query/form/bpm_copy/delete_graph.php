<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$strWorkflow = $_POST["wf"];
	if(!_validate_url_param($strWorkflow,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	$parsedFilter = "WHERE pk_workflow_id='".PrepareForSql($strWorkflow)."'";

	
	$sqlDatabase = "swdata";
	$sqlCommand = "UPDATE bpm_workflow SET graphxml = '' ".$parsedFilter;
	
	/*$strTable = "BPM_WORKFLOW";
	$arrData['PK_WORKFLOW_ID'] = PrepareForSql($strWorkflow);
	$arrData['GRAPHXML'] = '';
	$arc = xmlmc_updateRecord($strTable,$arrData);
	if(1==$arc)
	{
		throwSuccess();
	}
	else
	{
		throwError(100,$arc);
	}*/
?>