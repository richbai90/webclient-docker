<?php

	//-- 30.07.2010
	//-- given callrefs and aid return those that are watched
	include('../../../php/session.php');
	include('../../../php/xml.helpers.php');
	include('../../../php/db.helpers.php');
	
	//-- get xml file that defines the mes
	if(!isset($_POST['_callrefs']) || !isset($_POST['_aid'])) echo false;

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/call/callwatched/index.php","START","SERVI");
	}	

	//-- construct base sql (we want to get key field and status of call
	$strSQL = "SELECT callref from watchcalls where callref in (".$_POST['_callrefs'].") and analystid = '".strToLower(db_pfs($_POST['_aid'],"swsql"))."'";
	$oConn = swsys_connectdb("syscache");		
	
	$strXMLRS = "<resultset>";
	$result_id =_execute_xmlmc_sqlquery($strSQL,$oConn);
	if($result_id)
	{
		//-- get row
		$aRow = hsl_xmlmc_rowo($result_id);
		while($aRow)
		{
			$strXMLRS .= db_record_as_xml($aRow,"rec","","opencall",0,true);
			$aRow = hsl_xmlmc_rowo($result_id);
		}
	}
	else
	{
		//-- get last error
	}
	$strXMLRS .= "</resultset>";

	close_dbs();

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/call/callwatched/index.php","END","SERVI");
	}	

	echo $strXMLRS;

?>