<?php

	//-- get services customer is subscribed too - used in global.js oService.get_direct_customer_services

	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();
	
	//-- Get System Setting
	//$strSQL = "select SETTING_VALUE from SW_SETTINGS where PK_SETTING = 'SERVICE.CI_BEHAVIOUR.INCIDENT'";
	$strSQL = "SELECT SETTING_VALUE FROM SW_SBS_SETTINGS WHERE SETTING_NAME = 'SERVICE.CI_BEHAVIOUR.INCIDENT' AND APPCODE ='" . $_core['_sessioninfo']->dataset . "'";
	$oRS = new SqlQuery();
	$oRS->Query($strSQL);
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
		$strSetting = $oRS->GetValueAsString("SETTING_VALUE");
	}
	$res = $service->get_direct_customer_services($_POST['ks'],($_POST['bs']=="true" || $_POST['bs']=="1"),$strSetting);

	if($res=="")
	{
		throwProcessSuccessWithResponseAndMsg('0','Customer record could not be found.');
		exit;
	}
	throwProcessSuccessWithResponse($res);
	exit;
?>