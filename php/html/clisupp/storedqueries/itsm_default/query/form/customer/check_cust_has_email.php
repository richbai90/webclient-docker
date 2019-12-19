<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strKeysearch = $_POST["ks"];
	if(!_validate_url_param($strKeysearch,"sqlparamstrict") || $strKeysearch=="")
	{
		throwProcessErrorWithMsg("An invalid customer id was specified. Please contact your Administrator.");
		exit(0);
	}
	
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT COUNT(KEYSEARCH) AS KS_CNT FROM USERDB WHERE KEYSEARCH = '".PrepareForSql($strKeysearch)."' AND EMAIL != '' AND EMAIL IS NOT NULL";
?>