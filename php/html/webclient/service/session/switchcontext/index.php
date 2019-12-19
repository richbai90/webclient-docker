<?php

	//-- v1.0.0
	//-- service\session\switchcontext
	//-- given analystid and groupid switch analysts context

	include("../../../php/session.php");


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/session/switchcontext/index.php","START","SERVI");
	}

	$useAnalystID = $_POST['analystid'];
	$useGroupID = $_POST['groupid'];

	//-- Now we want to query the table rights for the analyst and return them back to the web client
	$strjs="";
	$oConn = connectdb("swcache");
	$sql = "UPDATE swsessions set contextanalystid = '" . db_pfs($useAnalystID) . "', contextgroupid = '" . db_pfs($useGroupID) . "'  WHERE sessionid = '" . db_pfs($_SESSION['swsession']) . "'";
	$result_id = _execute_xmlmc_sqlquery($sql,$oConn);
	if($result_id)
	{
		echo "true";
	}
	else
	{
		echo "false";
	}
	close_dbs();

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/session/switchcontext/index.php","END","SERVI");
	}

?>