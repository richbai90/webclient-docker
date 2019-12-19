<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	//-- use override
	$strFKs = $_POST['cikeys'];
	$strSite = $_POST['site'];
	if(!_validate_url_param($strSite,"sqlparamstrict"))
	{
		echo generateCustomErrorString("-100","Parameter passed may be a security risk. Please contact your Administrator.");
		exit(0);
	}
	$strCompanyID = $_POST['companyid'];
	if(!_validate_url_param($strCompanyID,"sqlparamstrict"))
	{
		echo generateCustomErrorString("-100","Parameter passed may be a security risk. Please contact your Administrator.");
		exit(0);
	}
	$strCompanyName = $_POST['companyname'];
	if(!_validate_url_param($strCompanyName,"sqlparamstrict"))
	{
		echo generateCustomErrorString("-100","Parameter passed may be a security risk. Please contact your Administrator.");
		exit(0);
	}
	
	// -- Build updateRecord
	$arrSelectedIDs = explode(",",$strFKs);
	foreach($arrSelectedIDs as $ID)
	{
		// -- Update each config_itemi record
		$strTable = "CONFIG_ITEMI";
		$arrData['PK_AUTO_ID'] = $ID;
		$arrData['FK_SITE'] = PrepareForSql($strSite);
		$arrData['FK_COMPANY_ID'] = PrepareForSql($strCompanyID);
		$arrData['COMPANYNAME'] = PrepareForSql($strCompanyName);
		$arrData['OWNER_NAME'] = '';
		$arrData['FK_USERDB'] = '';
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(0==$arc)
		{
			throwProcessErrorWithMsg("Failed to clear organisation value. Please contact your Administrator.");
			exit(0);		
		}
		throwSuccess();
	}	
	
?>