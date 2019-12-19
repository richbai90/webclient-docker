<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	$strKeysearch = $_POST["ks"];
	if(!_validate_url_param($strKeysearch,"sqlparamstrict") || $strKeysearch=="")
	{
		throwProcessErrorWithMsg("Invalid Customer ID specified. Please contact your Administrator.");
		exit(0);
	}
	
	$strSQL = "SELECT PK_AUTO_ID FROM USERDB_LOCKOUT WHERE LOGINID = '".$strKeysearch."'";
	$aRS = get_recordset($strSQL);
	if ($aRS->Fetch())
	{
		$strKeyValue  = get_field($aRS,"PK_AUTO_ID");
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load lockout. Please contact your Administrator.");
	}
	$strTable = "USERDB_LOCKOUT";
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