<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$intUpID = $_POST['id'];

	if(!_validate_url_param($intUpID,"num"))
	{
		throwProcessErrorWithMsg("Invalid notification id supplied. Please contact your Administrator.");
	}

	$strSQL = "select sequence from wss_notif where pk_auto_id=".$intUpID;
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$intSeq = get_field($aRS,"sequence");
		$intSeq++;
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load Link. Please contact your Administrator.");
	}

	$strTable = "wss_notif";
	$arrData['PK_AUTO_ID'] = $intUpID;
	$arrData['SEQUENCE'] = $intSeq;
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