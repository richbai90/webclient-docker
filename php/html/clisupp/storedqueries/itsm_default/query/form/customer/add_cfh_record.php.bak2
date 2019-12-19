<?php
	$strKeysearch = $_POST["ks"];
	if(!_validate_url_param($strKeysearch,"sqlparamstrict") || $strKeysearch=="")
	{
		throwProcessErrorWithMsg("An invalid customer id was specified. Please contact your Administrator.");
		exit(0);
	}
	
	$strUpdate = "insert into CFH_RA (FK_KEYSEARCH) values ('".PrepareForSql($strKeysearch)."')";
	$arc = SqlExecute('swdata',$strUpdate);
	if(0==$arc)
	{
		throwProcessErrorWithMsg("Failed to insert cfh record for customer. Please contact your Administrator.");
		exit(0);
	}

	$strPK = 0;
	$strSQL = "select * from cfh_ra where fk_keysearch='".PrepareForSql($strKeysearch)."'";
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
	}
	if($strPK>0)
	{
		$strSQL = "update USERDB set CFH_RA = ".$strPK." where KEYSEARCH ='".PrepareForSql($strKeysearch)."'";
		$arc = SqlExecute('swdata',$strSQL);
		if(0==$arc)
		{
			throwProcessErrorWithMsg("Failed to update customer with cfh record. Please contact your Administrator.");
			exit(0);
		}
	}
	else
	{
		throwProcessErrorWithMsg("Failed to retrieve cfh record for customer. Please contact your Administrator.");
		exit(0);
	}
	 throwSuccess();
?>