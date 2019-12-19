<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$intUpID = $_POST['uriid'];

	if(!_validate_url_param($intUpID,"num"))
	{
		throwProcessErrorWithMsg("Invalid URI id. Please contact your Administrator.");
	}

	$strSQL = "select nindex from itsm_oc_uri where pk_ocuri_id=".$intUpID;
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$intSeq = get_field($aRS,"nindex");
		$intSeq++;
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load URI. Please contact your Administrator.");
	}

	$strTable = "ITSM_OC_URI";
	$arrData['PK_OCURI_ID'] = $intUpID;
	$arrData['NINDEX'] = $intSeq;
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