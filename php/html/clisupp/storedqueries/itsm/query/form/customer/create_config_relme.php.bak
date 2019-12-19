<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	$strKeysearch = $_POST["ks"];
	if(!_validate_url_param($strKeysearch,"sqlparamstrict") || $strKeysearch=="")
	{
		throwProcessErrorWithMsg("Invalid Customer ID specified. Please contact your Administrator.");
		exit(0);
	}

	$strKey = $_POST["key"];
	if(!_validate_url_param($strKey,"num") || $strKey=="")
	{
		throwProcessErrorWithMsg("Invalid CI Key was specified. Please contact your Administrator.");
		exit(0);
	}

	$strFullname 	= "";
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
		$strPK =  get_field($oRS,"PK_AUTO_ID");
		$strFullname 	= get_field($oRS,"fullname");				
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load Customer Record. Please contact your Administrator.");
		exit(0);
	}

	
	$strSQL = "select * from config_itemi where pk_auto_id='".PrepareForSql($strKey)."'";
	$oRS = get_recordset($strSQL,"swdata");
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
		$strPK =  get_field($oRS,"PK_AUTO_ID");
		$ck_config_item 	= get_field($oRS,"ck_config_item");				
		$ck_config_type 	= get_field($oRS,"ck_config_type");
		$isactivebaseline= get_field($oRS,"isactivebaseline");
		$cmdb_status  	= get_field($oRS,"cmdb_status");
		$fk_status_level = get_field($oRS,"fk_status_level");		
		$description  	= get_field($oRS,"description");				
	}
	else
	{
		throwProcessErrorWithMsg("Unable to load CI. Please contact your Administrator.");
		exit(0);
	}

	$strTable = "CONFIG_RELME";
	$arrData['CODE'] = 'CUSTOMER';
	$arrData['FK_CI_ID'] = $strPK;
	$arrData['FK_ME_KEY'] = PrepareForSql($strKeysearch);
	$arrData['ME_TABLE'] = 'USERDB';
	$arrData['ME_DESCRIPTION'] = PrepareForSql($strFullname);
	$arrData['CI_DESCRIPTION'] = PrepareForSql($description);
	$arrData['PRIORITY'] = '0 - None';
	$arrData['CI_TYPE'] = PrepareForSql($ck_config_type);
	$arrData['CI_STATUS'] = PrepareForSql($fk_status_level);
	$arrData['CI_CMDBSTATUS'] = PrepareForSql($cmdb_status);
	$arrData['CI_CONFIG_ITEM'] = PrepareForSql($ck_config_item);
	$arrData['CI_ACTIVE'] = PrepareForSql($isactivebaseline);
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