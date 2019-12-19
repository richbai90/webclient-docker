<?php

	//-- v1.0.0
	//-- service\session\switchddf
	//-- given appname switc ddf

	include("../../../php/session.php");


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/session/switchddf/index.php","START","SERVI");
	}

	$useApplication = $_POST['_switchddf'];
	if($useApplication!=="")
	{
		$_SESSION["_wc_application_context"] = $useApplication;

		//-- modify session table so appname is set to useApplication
		$strSQL = "update swsessions set currentdatadictionary = '".$useApplication."' where sessionid = '".$_POST['swsessionid']."'";
		_execute_xmlmc_sqlquery($strSQL, "sw_systemdb");
		echo "ok";
	}
	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/session/switchddf/index.php","END","SERVI");
	}
?>