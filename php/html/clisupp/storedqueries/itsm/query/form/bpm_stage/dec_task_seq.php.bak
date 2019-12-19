<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$intUpID = $_POST['tid'];

	if(!_validate_url_param($intUpID,"num"))
	{
		throwProcessErrorWithMsg("Invalid task id supplied. Please contact your Administrator.");
	}

	$strSQL = "select seq from bpm_stage_task where pk_auto_id=".$intUpID;
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$intSeq = get_field($aRS,"seq");
		$intSeq--;
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load stage task. Please contact your Administrator.");
	}

	$strTable = "BPM_STAGE_TASK";
	$arrData['PK_AUTO_ID'] = $intUpID;
	$arrData['SEQ'] = $intSeq;
	$arc = xmlmc_updateRecord($strTable,$arrData);
	if(1==$arc)
	{
		throwSuccess();
	}
	else
	{
		throwError(100,$arc);
	}
?>