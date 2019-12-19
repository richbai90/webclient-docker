<?php
	$strSite = $_POST["site"];
	if(!_validate_url_param($strSite,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid contract was specified. Please contact your Administrator.");
		exit(0);
	}

	$strCompany = $_POST["company"];
	if(!_validate_url_param($strCompany ,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("Invalid text was specified. Please contact your Administrator.");
		exit(0);
	}

	$strEquipId = $_POST["eid"];
	if(!_validate_url_param($strEquipId ,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("Invalid text was specified. Please contact your Administrator.");
		exit(0);
	}

	$strInsert = "insert into ASSET_SITE (FK_SITE_NAME,FK_EQUIPID,FK_COMPANY_ID) values ('".PrepareForSql($strSite)."','".PrepareForSql($strEquipId)."','".PrepareForSql($strCompany)."')";
	$arc = SqlExecute('swdata',$strInsert);
	if(0==$arc)
	{
		throwProcessErrorWithMsg($arc."Failed to add diary entry. Please contact your Administrator.");
		exit(0);
	}

	throwSuccess();
?>