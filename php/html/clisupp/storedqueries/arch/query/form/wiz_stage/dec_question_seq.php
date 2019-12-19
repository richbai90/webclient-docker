<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$intUpID = $_POST['qid'];

	if(!_validate_url_param($intUpID,"num"))
	{
		throwProcessErrorWithMsg("Invalid question id supplied. Please contact your Administrator.");
	}

	$strSQL = "select qindex from wssm_wiz_q where pk_qid=".$intUpID;
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$intSeq = get_field($aRS,"qindex");
		$intSeq--;
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load stage. Please contact your Administrator.");
	}
	
	$strTable = "WSSM_WIZ_Q";
	$arrData['PK_QID'] = $intUpID;
	$arrData['QINDEX'] = $intSeq;
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