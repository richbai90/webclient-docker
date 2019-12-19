<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$intUpID = $_POST['vid'];

	if(!_validate_url_param($intUpID,"num"))
	{
		throwProcessErrorWithMsg("Invalid Link id supplied. Please contact your Administrator.");
	}

	$strSQL = "select view_order from wssm_links where pk_id=".$intUpID;
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$intSeq = get_field($aRS,"view_order");
		$intSeq--;
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load Link. Please contact your Administrator.");
	}

	$strTable = "WSSM_LINKS";
	$arrData['PK_ID'] = $intUpID;
	$arrData['VIEW_ORDER'] = $intSeq;
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