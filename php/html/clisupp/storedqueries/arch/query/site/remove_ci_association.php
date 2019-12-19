<?php
	IncludeApplicationPhpFile("itsm.helpers.php");	
	
	$strKeys = $_POST["cikeys"];
	$strSite = $_POST["site"];
	if(!_validate_url_param($strSite,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
	
	// -- Build updateRecord
	$arrSelectedIDs = explode(",",$strKeys);
	foreach($arrSelectedIDs as $ID)
	{
		$strTable = "CONFIG_ITEMI";
		$arrData['PK_AUTO_ID'] = $ID;
		$arrData['FK_SITE'] = '';
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(0==$arc)
		{
			throwProcessErrorWithMsg("Failed to clear site value. Please contact your Administrator.");
			exit(0);	
		}
		throwSuccess();
	}
?>