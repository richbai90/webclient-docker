<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	$strKey = $_POST["cust"];
	if(!_validate_url_param($strKey,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$strSite = $_POST["site"];
	if(!_validate_url_param($strSite,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	// -- Build updateRecord	
	$strTable = "USERDB";
	$arrData['KEYSEARCH'] = PrepareForSql($strKey);
	$arrData['SITE'] = '';
	$arc = xmlmc_updateRecord($strTable,$arrData);
	if(0==$arc)
	{
		throwProcessErrorWithMsg("Failed to clear site value. Please contact your Administrator.");
		exit(0);	
	}
	throwSuccess();
?>