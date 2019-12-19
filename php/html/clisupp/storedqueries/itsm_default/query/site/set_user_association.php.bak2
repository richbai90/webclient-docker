<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	//-- use override
	$strFKs = $_POST['users'];
	if(!_validate_url_param($strFKs,"sqlparamstrict"))
	{
		echo generateCustomErrorString("-100","Parameter passed may be a security risk. Please contact your Administrator.");
		exit(0);
	}
	$strSite = $_POST['site'];
	if(!_validate_url_param($strSite,"sqlparamstrict"))
	{
		echo generateCustomErrorString("-100","Parameter passed may be a security risk. Please contact your Administrator.");
		exit(0);
	}

	// -- Build updateRecord
	$arrSelectedIDs = explode(",",$strFKs);
	foreach($arrSelectedIDs as $ID)
	{
		$strTable = "USERDB";
		$arrData['KEYSEARCH'] = $ID;
		$arrData['SITE'] = PrepareForSql($strSite);
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(0==$arc)
		{
			throwProcessErrorWithMsg("Failed to clear site value. Please contact your Administrator.");
			exit(0);		
		}
		throwSuccess();
	}
?>