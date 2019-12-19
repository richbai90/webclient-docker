<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	$strOrgKey = $_POST["org"];
	if(!_validate_url_param($strOrgKey,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	
	// -- Build an array of columns to set for updateRecord
	$strTable = "COMPANY";
	$arrData['PK_COMPANY_ID'] = PrepareForSql($strOrgKey);
	$arrData['FK_COMPANY_ID'] = '';
	
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