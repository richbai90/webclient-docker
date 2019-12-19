<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strKeysearch = $_POST["ks"];
	if(!_validate_url_param($strKeysearch,"sqlparamstrict") || $strKeysearch=="")
	{
		throwProcessErrorWithMsg("An invalid customer id was specified. Please contact your Administrator.");
		exit(0);
	}
	
	$strCatId = $_POST["cid"];
	if(!_validate_url_param($strCatId,"num") || $strCatId=="")
	{
		throwProcessErrorWithMsg("An invalid category id was specified. Please contact your Administrator.");
		exit(0);
	}

	$strCatName = $_POST["cname"];
	if(!_validate_url_param($strCatName,"sqlparamstrict") || $strCatName=="")
	{
		throwProcessErrorWithMsg("An invalid category name was specified. Please contact your Administrator.");
		exit(0);
	}

	$strTable = "USERDB_KBNOTIF";
	$arrData['FK_KEYSEARCH'] = PrepareForSql($strKeysearch);
	$arrData['FK_CAT_ID'] = PrepareForSql($strCatId);
	$arrData['FK_CAT_NAME'] = PrepareForSql($strCatName);
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