<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$intActionID = $_POST['aid'];
	$strScript = $_POST['script'];
	$intNextPos = $_POST['nid'];

	if(!_validate_url_param($intActionID,"num"))
	{
		throwProcessErrorWithMsg("Invalid value supplied 1. Please contact your Administrator.");
		exit;
	}
	if(!_validate_url_param($intNextPos,"num"))
	{
		throwProcessErrorWithMsg("Invalid value supplied 2. Please contact your Administrator.");
		exit;
	}

	if(!_validate_url_param($strScript,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("Invalid value supplied 3. Please contact your Administrator.");
		exit;
	}
	
	$strTable = "CI_AVAIL_VPME";
	$arrData['FK_ACTION_ID'] = $intActionID;
	$arrData['VPMESCRIPT'] = PrepareForSql($strScript);
	$arrData['EXECORDER'] = $intNextPos;
	$arc = xmlmc_addRecord($strTable,$arrData);
	if(1==$arc)
	{
		throwSuccess();
	}
	else
	{
		throwError(100,$arc);
	}
?>