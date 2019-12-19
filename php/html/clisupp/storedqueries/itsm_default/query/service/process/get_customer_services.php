<?php

	//-- get services customer is subscribe too - used in global.js oService.get_customerservices

	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();
	
	//-- Get System Setting
	$strCallCalss = $_POST['cc'];
	if ($strCallCalss=="SR")
	{
		$strSetting = "SERVICE.CI_BEHAVIOUR.SERVICEREQUEST";
	}
	else
	{
		$strSetting = "SERVICE.CI_BEHAVIOUR.INCIDENT";
	}
	//$strSQL = "select SETTING_VALUE from SW_SETTINGS where PK_SETTING = '" . $strSetting . "'";
	$strSQL = "SELECT SETTING_VALUE FROM SW_SBS_SETTINGS WHERE SETTING_NAME = '" . $strSetting . "' AND APPCODE  = '" . $_core['_sessioninfo']->dataset . "'";
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
		if ($strSetting=="True"){
			$boolSetting = true;
		}
		else
		{
			$boolSetting = false;
		}
	}
	if($_POST['cf']=="true")
		$boolSetting = false;
	$res = $service->get_customer_services($_POST['ks'],($_POST['bs']=="true" || $_POST['bs']=="1"),$boolSetting,$strCallCalss);

	if($res=="")
	{
		throwProcessSuccessWithResponseAndMsg('0','Customer record could not be found.');
		exit;
	}
	throwProcessSuccessWithResponse($res);
	exit;
?>