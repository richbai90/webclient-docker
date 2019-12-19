<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$intUpID = $_POST['cid'];

	if(!_validate_url_param($intUpID,"num"))
	{
		throwProcessErrorWithMsg("Invalid choice id supplied. Please contact your Administrator.");
	}

	$strSQL = "select cindex from wssm_wiz_qc where pk_qcid=".$intUpID;
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$intSeq = get_field($aRS,"cindex");
		$intSeq++;
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load stage. Please contact your Administrator.");
	}

	$strTable = "WSSM_WIZ_QC";
	$arrData['PK_QCID'] = $intUpID;
	$arrData['CINDEX'] = $intSeq;
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