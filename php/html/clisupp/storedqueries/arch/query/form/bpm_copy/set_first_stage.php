<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strWorkflow = $_POST["wf"];
	if(!_validate_url_param($strWorkflow,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$intStageId = $_POST["sid"];
	if(!_validate_url_param($intStageId,"num"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$strTable = "BPM_WORKFLOW";
	$arrData['PK_WORKFLOW_ID'] = PrepareForSql($strWorkflow);
	$arrData['FK_FIRSTSTAGE_ID'] = PrepareForSql($intStageId);
	$arc = xmlmc_updateRecord($strTable,$arrData);
	if(1==$arc)
	{
		throwSuccess();
	}
	else
	{
		throwError(100,$arc);
	}
	
	/*$strUpdate = "update bpm_workflow set fk_firststage_id = ".PrepareForSql($intStageId)." where pk_workflow_id ='". PrepareForSql($strWorkflow) ."'"; 

	$arc = SqlExecute('swdata',$strUpdate);
	if(0==$arc)
	{
		throwProcessErrorWithMsg("Failed to set workflow first stage. Please contact your Administrator.");
		exit(0);
	}
	throwSuccess();*/
?>