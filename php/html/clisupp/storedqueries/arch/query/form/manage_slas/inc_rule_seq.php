<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$intUpID = $_POST['sid'];

	if(!_validate_url_param($intUpID,"num"))
	{
		throwProcessErrorWithMsg("Invalid Rule ID supplied. Please contact your Administrator.");
	}

	$strSQL = "select seq from itsm_sla_rules where pk_auto_id=".$intUpID;
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$intSeq = get_field($aRS,"seq");
		$intSeq++;
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load Rule. Please contact your Administrator.");
	}

	$strTable = "itsm_sla_rules";
	$arrData['pk_auto_id'] = $intUpID;
	$arrData['seq'] = $intSeq;
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