<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$intUpID = $_POST['sid'];

	if(!_validate_url_param($intUpID,"num"))
	{
		throwProcessErrorWithMsg("Invalid Condition ID supplied. Please contact your Administrator.");
	}

	$strSQL = "select seq from bpm_authcond_rel where pk_auto_id=".$intUpID;
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$intSeq = get_field($aRS,"seq");
		$intSeq--;
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load Condition. Please contact your Administrator.");
	}

	$strTable = "BPM_AUTHCOND_REL";
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