<?php

	//-- 23.07.2010
	//-- given analystid and analyst groups get list of calls that were lastupdated since time() and also for analysts current context

	include('../../../php/session.php');
	include('../../../php/db.helpers.php');

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/call/getupdatedcallslist/index.php","START","SERVI");
	}	

	$counter=1;
	$aRow = false;
	$returnxml="";
	$oConn = connectdb("syscache");		

	//-- standard opencall field to get
	$strStdOpencallFields = "OPENCALL.lastactdatex as swlastactdatex, OPENCALL.prob_text as prbdesc, OPENCALL.last_text as lastdesc ";

	//-- no context 
	$strSQL = "SELECT ".$_POST['_selectcols'].",".$strStdOpencallFields." FROM OPENCALL WHERE lastactdatex > ". $_POST["_last_lastactdatex"];


	//-- get all calls that have been updated in last whatever seconds
	//$strSQL = "SELECT * FROM OPENCALL WHERE lastactdatex > ". (time() - $_POST["_backpollseconds"]);
	//echo $strSQL;
	$result_id = _execute_xmlmc_sqlquery($strSQL,$oConn);
	if($result_id)
	{
		//-- get row
		$aRow = hsl_xmlmc_rowo($result_id);
		while($aRow)
		{
			$returnxml .= db_record_as_xml($aRow,"row","callref","opencall",0,true);
			$aRow = hsl_xmlmc_rowo($result_id);
		}
	}
	else
	{
		//-- error
		$returnxml .= "<error>Failed to fetch update calls list</error>";
	}

	close_dbs();

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/call/getupdatedcallslist/index.php","END","SERVI");
	}	

	echo "<updatedcalls>".$returnxml."</updatedcalls>";
	exit;
?>