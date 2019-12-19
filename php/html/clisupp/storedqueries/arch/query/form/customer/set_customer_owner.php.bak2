<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strKeysearch = $_POST["ks"];
	if(!_validate_url_param($strKeysearch,"sqlparamstrict") || $strKeysearch=="")
	{
		throwProcessErrorWithMsg("Invalid Customer ID specified. Please contact your Administrator.");
		exit(0);
	}

	$strKeys = $_POST["keys"];
	if(!_validate_url_param($strKeys,"csnum") || $strKeys=="")
	{
		throwProcessErrorWithMsg("Invalid list of CI Keys was specified. Please contact your Administrator.");
		exit(0);
	}

	
	$strFullName = "";
	$strCompanyId = "";
	$strCompanyName = "";
	$strSQL = "select * from userdb where keysearch='".PrepareForSql($strKeysearch)."'";
	$oRS = get_recordset($strSQL,"swdata");
	//-- Include App Specific Helpers File
    IncludeApplicationPhpFile("app.helpers.php");
	//-- Check for XMLMC Error
	if($oRS->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRS->lastErrorResponse);
		exit(0);
	}
	//-- END
	if($oRS->Fetch())
	{ 
		$strFullName =  get_field($oRS,"fullname");
		$strCompanyId =  get_field($oRS,"fk_company_id");
		$strCompanyName =  get_field($oRS,"companyname");
	}

	$strKeys = prepareNumericCommaDelimitedValues($strKeys);
	$arrKeys = explode(',',$strKeys);
	
	foreach ($arrKeys as $key)
	{
		$strTable = "CONFIG_ITEMI";
		$arrData['PK_AUTO_ID'] = $key;
		$arrData['FK_USERDB'] = PrepareForSql($strKeysearch);
		$arrData['OWNER_NAME'] = PrepareForSql($strFullName);
		$arrData['FK_COMPANY_ID'] = PrepareForSql($strCompanyId);
		$arrData['COMPANYNAME'] = PrepareForSql($strCompanyName);
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(1==$arc)
		{
			//-- record updated successfully
		}
		else
		{
			throwError(100,$arc);
		}
	}
	throwSuccess();
?>