<?php
	IncludeApplicationPhpFile("itsm.helpers.php");

	$strFKs = $_POST['cikeys'];
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
	
	$strSelectedKeys = prepareNumericCommaDelimitedValues($strFKs);
	$arrSelectedKeys = explode(',',$strSelectedKeys);
	
	// -- Build an array of columns to set for updateRecord. More than one CI can be selected
	foreach ($arrSelectedKeys as $key)
	{
		$strTable = "CONFIG_ITEMI";
		$arrData['PK_AUTO_ID'] = $key;
		$arrData['FK_COMPANY_ID'] = PrepareForSql($strOrganisationId);
		$arrData['COMPANYNAME'] = PrepareForSql($strOrganisationName);
		$arrData['OWNER_NAME'] = '';
		$arrData['FK_USERDB'] = '';
		
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