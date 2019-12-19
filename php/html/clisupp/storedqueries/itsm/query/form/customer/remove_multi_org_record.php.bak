<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strKeysearch = $_POST["ks"];
	if(!_validate_url_param($strKeysearch,"sqlparamstrict") || $strKeysearch=="")
	{
		throwProcessErrorWithMsg("An invalid customer id was specified. Please contact your Administrator.");
		exit(0);
	}
	
	$strOrganisation = $_POST["orgid"];
	if(!_validate_url_param($strOrganisation,"sqlparamstrict") || $strOrganisation=="")
	{
		throwProcessErrorWithMsg("An invalid company id was specified. Please contact your Administrator.");
		exit(0);
	}

	$strSQL = "SELECT PK_ID FROM USERDB_COMPANY WHERE FK_USER_ID = '".PrepareForSql($strKeysearch)."' AND FK_ORG_ID = '".PrepareForSql($strOrganisation)."'";
	$aRS = get_recordset($strSQL);
	if ($aRS->Fetch())
	{
		$strKeyValue  = get_field($aRS,"PK_ID");
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load organisation association. Please contact your Administrator.");
	}
	$strTable = "USERDB_COMPANY";
	$arc = xmlmc_deleteRecord($strTable,$strKeyValue);
	if(1==$arc)
	{
		throwSuccess();
	}
	else
	{
		throwError(100,$arc);
	}
?>