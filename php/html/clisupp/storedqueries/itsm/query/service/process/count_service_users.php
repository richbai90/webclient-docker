<?php

	//-- global.js oservice.prototype count_service_users

	$strServiceID = pfs($_POST['sid']);

	$strWhere = "";
	$strSQL  = "SELECT * from sc_subscription where REL_TYPE='SUBSCRIPTION' and fk_service = ". $strServiceID;
	$strDB = "swdata";
	$oRS  = get_recordset($strSQL,$strDB);
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
	while ($oRS->Fetch())
	{ 
		$strType = LC(get_field($oRS,"fk_me_table"));
		if ($strType=='company')
		{
			if($strWhere!="")$strWhere.=" OR ";
			$strWhere .= " fk_company_id = '".pfs(get_field($oRS,"fk_me_key"))."'";
		}else if ($strType == 'userdb')
		{
			if($strWhere!="")$strWhere.=" OR ";
			$strWhere .= " keysearch = '".pfs(get_field($oRS,"fk_me_key"))."'";
		}else if ($strType =='department')
		{
			if($strWhere!="")$strWhere.=" OR ";
			$strWhere .= " department = '".pfs(get_field($oRS,"fk_me_key"))."' OR subdepartment = '".pfs(get_field($oRS,"fk_me_key"))."'";
		}
	}

	if($strWhere=="")
	{
		//-- return count of 0
		throwRowCountResponse(0);
		exit;
	}

	$sqlDatabase = "swdata";
	$sqlCommand  = "SELECT COUNT(*) AS COUNT FROM USERDB WHERE ". $strWhere;

?>