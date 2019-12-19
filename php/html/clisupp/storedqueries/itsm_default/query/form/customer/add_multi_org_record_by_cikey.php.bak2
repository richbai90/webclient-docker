<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strKeysearch = $_POST["ks"];
	if(!_validate_url_param($strKeysearch,"sqlparamstrict") || $strKeysearch=="")
	{
		throwProcessErrorWithMsg("An invalid customer id was specified. Please contact your Administrator.");
		exit(0);
	}
	
	$intCIKey = $_POST["key"];
	if(!_validate_url_param($intCIKey,"num") || $intCIKey=="")
	{
		throwProcessErrorWithMsg("An invalid company id was specified. Please contact your Administrator.");
		exit(0);
	}

	$oCompany = get_recordwhere("company", "fk_cmdb_id = ".$intCIKey);
	$intCount = get_rowcount("userdb_company", "FK_USER_ID = '". PrepareForSql($strKeysearch) ."' and FK_ORG_ID = '".PrepareForSql($oCompany['pk_company_id']) ."'");
	if (0==$intCount) 
	{
		$strTable = "USERDB_COMPANY";
		$arrData['FK_USER_ID'] = PrepareForSql($strKeysearch);
		$arrData['FK_ORG_ID'] = PrepareForSql($oCompany['pk_company_id']);
		$arc = xmlmc_addRecord($strTable,$arrData);
		if(1==$arc)
		{
			throwSuccess();
		}
		else
		{
			throwError(100,$arc);
		}
	}
?>