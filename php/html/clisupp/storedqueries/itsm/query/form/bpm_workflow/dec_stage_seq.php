<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$intUpID = $_POST['sid'];

	if(!_validate_url_param($intUpID,"num"))
	{
		throwProcessErrorWithMsg("Invalid Stage id supplied. Please contact your Administrator.");
	}

	$strSQL = "select seq from bpm_stage where pk_stage_id=".$intUpID;
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$intSeq = get_field($aRS,"seq");
		$intSeq--;
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load stage. Please contact your Administrator.");
	}

	$strTable = "BPM_STAGE";
	$arrData['PK_STAGE_ID'] = $intUpID;
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