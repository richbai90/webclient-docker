<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	$strOrgKey = $_POST["parent"];
	if(!_validate_url_param($strOrgKey,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	$intKey = $_POST["cikey"];
	if(!_validate_url_param($intKey,"num"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	
	// -- Build an array of columns to set for updateRecord
	$strTable = "CONFIG_ITEMI";
	$arrData['PK_AUTO_ID'] = $intKey;
	$arrData['FK_COMPANY_ID'] = '';
	$arrData['FK_USERDB'] = '';
	$arrData['COMPANYNAME'] = '';
	$arrData['OWNER_NAME'] = '';
	
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