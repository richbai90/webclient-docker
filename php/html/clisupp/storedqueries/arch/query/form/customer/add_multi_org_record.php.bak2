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
	
	// -- Check if relationship already exists in USERDB_COMPANY
	$strSQL = "SELECT COUNT(PK_ID) AS CNT_KS FROM USERDB_COMPANY WHERE FK_USER_ID ='".PrepareForSql($strKeysearch)."' AND FK_ORG_ID = '".PrepareForSql($strOrganisation)."'";
	$oRS = get_recordset($strSQL,"swdata");
	$intCNT_KS = 0;
	if($oRS->Fetch()) $intCNT_KS = get_field($oRS,"CNT_KS");
	
	// -- If no relationship exists, then create it
	if($intCNT_KS==0)
	{	
		$strTable = "USERDB_COMPANY";
		$arrData['FK_USER_ID'] = PrepareForSql($strKeysearch);
		$arrData['FK_ORG_ID'] = PrepareForSql($strOrganisation);
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
	else throwSuccess();
?>