<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	$strFKs = $_POST['sites'];
	if(!_validate_url_param($strFKs,"sqlparamstrict"))
	{
		echo generateCustomErrorString("-100","Parameter passed may be a security risk. Please contact your Administrator.");
		exit(0);
	}
	$strOrganisationId = $_POST['parentid'];
	if(!_validate_url_param($strOrganisationId,"sqlparamstrict"))
	{
		echo generateCustomErrorString("-100","Parameter passed may be a security risk. Please contact your Administrator.");
		exit(0);
	}
	$strOrganisationName = $_POST['parentname'];
	if(!_validate_url_param($strOrganisationName,"sqlparamstrict"))
	{
		echo generateCustomErrorString("-100","Parameter passed may be a security risk. Please contact your Administrator.");
		exit(0);
	}
	
	$arrSelectedKeys = explode(',',$strFKs);
	// -- Build an array of columns to set for updateRecord
	foreach ($arrSelectedKeys as $key)
	{
		$strTable = "SITE";
		$arrData['SITE_NAME'] = PrepareForSql($key);
		$arrData['FK_COMPANY_ID'] = PrepareForSql($strOrganisationId);
		//$arrData['COMPANYNAME'] = PrepareForSql($strOrganisationName); // companyname is not in site table
		
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(1==$arc)
		{
			continue;
		}
		else
		{
			throwError(100,$arc);
		}
	}
	throwSuccess();

?>