<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$intUpID = $_POST['sid'];

	if(!_validate_url_param($intUpID,"num"))
	{
		throwProcessErrorWithMsg("Invalid Stage id supplied. Please contact your Administrator.");
	}

	$strSQL = "select pindex from bpm_progress where pk_progid=".$intUpID;
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$intSeq = get_field($aRS,"pindex");
		$intSeq++;
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load Stage. Please contact your Administrator.");
	}

	$strTable = "BPM_PROGRESS";
	$arrData['PK_PROGID'] = $intUpID;
	$arrData['PINDEX'] = $intSeq;
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