<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$intUpID = $_POST['vid'];

	if(!_validate_url_param($intUpID,"num"))
	{
		throwProcessErrorWithMsg("Invalid vpme id supplied. Please contact your Administrator.");
	}

	$strSQL = "select execorder from bpm_cond_vpme where pk_auto_id=".$intUpID;
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$intSeq = get_field($aRS,"execorder");
		$intSeq++;
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load vpme condition. Please contact your Administrator.");
	}

	$strTable = "BPM_COND_VPME";
	$arrData['PK_AUTO_ID'] = $intUpID;
	$arrData['EXECORDER'] = $intSeq;
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