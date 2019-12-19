<?php

	//-- v1.0.0
	//-- service\session\getanalyststatus
	//-- return js string containing analyst status and other basic info

	include("../../../php/session.php");

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/session/getanalyststatus/index.php","START","SERVI");
	}

	//-- analyst to get rights for - if not passed in  use session
	$useAnalystID = $_POST['analystid'];
	if($useAnalystID=="")$useAnalystID = $oAnalyst->analystid;
	

	//-- Now we want to query the table rights for the analyst and return them back to the web client
	$strjs="";
	$oConn = connectdb("swcache");
	$sql = "SELECT availablestatus,availablestatusmessage,maxassignedcalls,rightsg,priveligelevel from swanalysts WHERE analystid = '" . db_pfs($useAnalystID) . "'";
	$result_id = _execute_xmlmc_sqlquery($sql,$oConn);
	if($result_id)
	{
		if($aRow = hsl_xmlmc_rowo($result_id))
		{
			$strjs="var tmpObject = new Object();";

			$strjs.="tmpObject.nStatus = " . $aRow->availablestatus. ";";
			$strjs.="tmpObject.strMessage = '" . str_replace("'","\'",$aRow->availablestatusmessage) . "';";
			$strjs.="tmpObject.nMaxAssignedCalls = " . $aRow->maxassignedcalls. ";";
			$strjs.="tmpObject.bAssignBlocked = " . $aRow->rightsg. ";";
			$strjs.="tmpObject.nRole = " . $aRow->priveligelevel. ";";
		}
	}

	close_dbs();

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/session/getanalyststatus/index.php","END","SERVI");
	}

	echo $strjs;
?>