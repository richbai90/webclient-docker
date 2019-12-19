<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strContractID = $_POST['contract'];
	$intUnits = $_POST['units'];

	if(!_validate_url_param($strContractID,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("Invalid value supplied. Please contact your Administrator.");
		exit;
	}
	if(!_validate_url_param($intUnits,"num"))
	{
		throwProcessErrorWithMsg("Invalid value supplied. Please contact your Administrator.");
		exit;
	}

	$strTable = "CONTRACT";
	$arrData['PK_CONTRACT_ID'] = PrepareForSql($strContractID);
	$arrData['SUPPORT_UNITS_AVAIL'] = $intUnits;
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