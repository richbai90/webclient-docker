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

	$strSQL = "SELECT PK_AUTO_ID FROM USERDB_KBNOTIF WHERE FK_KEYSEARCH = '".PrepareForSql($strKeysearch)."' AND FK_CAT_ID=".PrepareForSql($strCatId);
	$aRS = get_recordset($strSQL);
	if ($aRS->Fetch())
	{
		$strKeyValue  = get_field($aRS,"PK_AUTO_ID");
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load notification association. Please contact your Administrator.");
	}
	$strTable = "USERDB_KBNOTIF";
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