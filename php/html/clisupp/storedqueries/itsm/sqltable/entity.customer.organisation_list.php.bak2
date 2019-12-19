<?php
	if(!isset($_POST['ks']) ||$_POST['ks']=="")
	{
		//echo generateCustomErrorString("-100","An invalid customer id was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	
	$strKeysearch = $_POST["ks"];

	$strCompanyIDs = "";
	$strSQL = "select FK_ORG_ID from USERDB_COMPANY where FK_USER_ID = '".PrepareForSql($strKeysearch)."'";
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
	while($oRS->Fetch())
	{ 
		if($strCompanyIDs!="")$strCompanyIDs .=",";
		$strCompanyIDs .=  "'".PrepareForSql(get_field($oRS,"FK_ORG_ID"))."'";
	}
	
	if($strCompanyIDs=="")
	{
		//throw error
		echo generateCustomErrorString("-100","Customer not associated with any organisations. Please contact your Administrator.");
		exit(0);
	}

	$where = " where pk_company_id in (".$strCompanyIDs.")";
	//-- command
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>