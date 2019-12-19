<?php

	//-- v1.0.0
	//-- service\session\getrights
	//-- return xml string containing analysts rights to table, client and application
	include("../../../php/session.php");

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/session/getrights/index.php","START","SERVI");
	}

	//--
	//-- call xmlmc GetSessionInfo2
	$xmlmc = new XmlMethodCall();
	if(!$xmlmc->invoke("session","getSessionInfo2",true))
	{
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/session/getrights/index.php","ERROR","SERVI");
		}
		exit(0);
	}

	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/session/getrights/index.php","END","SERVI");
	}

	
	echo $xmlmc->xmlresult;
	exit(0);
?>