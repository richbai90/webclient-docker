<?php

	//--
	//-- load log\support_info.xml and return
	include("../../../php/session.php");

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/session/getlicinfo/index.php","START","SERVI");
	}

	//-- 
	$strXmFilePath = $portal->fs_server_installpath . "log/support_info.xml";
	$xmlfp = @file_get_contents($strXmFilePath);
	if($xmlfp==false)
	{
		return "";
	}

	//-- convert to xml
	$x = @domxml_open_mem($xmlfp);
	if($x==false)
	{
		return "";
	}

	$xmlFeatures = $x->get_elements_by_tagname("features");
	echo '<?xml version="1.0" encoding="UTF-8"?><supportworksEspSupportInformation><features>' . $x->dump_node($xmlFeatures[0]) . '</features></supportworksEspSupportInformation>';
 	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/session/getlicinfo/index.php","END","SERVI");
	}
	exit(0);	
?>