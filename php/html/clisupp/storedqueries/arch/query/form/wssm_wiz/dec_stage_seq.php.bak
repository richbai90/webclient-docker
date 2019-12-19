<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$intUpID = $_POST['sid'];

	if(!_validate_url_param($intUpID,"num"))
	{
		throwProcessErrorWithMsg("Invalid step id supplied. Please contact your Administrator.");
	}

	$strSQL = "select sindex from wssm_wiz_stage where pk_auto_id=".$intUpID;
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$intSeq = get_field($aRS,"sindex");
		$intSeq--;
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load stage. Please contact your Administrator.");
	}

	$strTable = "WSSM_WIZ_STAGE";
	$arrData['PK_AUTO_ID'] = $intUpID;
	$arrData['SINDEX'] = $intSeq;
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