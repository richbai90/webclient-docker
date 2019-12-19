<?php

	//-- 21.07.2010
	//-- given callref get lastupdatex date
	include('../../../php/session.php');
	include('../../../php/db.helpers.php');
	
	//-- get xml file that defines the mes
	if(!isset($_POST['_callref']) && !isset($_POST['_lastdatex'])) 
	{
		echo "-1";
		exit;
	}

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/call/getlastupdatedate/index.php","START","SERVI");
	}	

	$returnvalue=0;
	$oConn = swsys_connectdb("syscache");		

	$strSQL = "SELECT lastactdatex FROM OPENCALL WHERE CALLREF = " . $_POST['_callref'] ." AND lastactdatex > ".$_POST['_lastdatex'];
	$result_id = _execute_xmlmc_sqlquery($strSQL,$oConn);
	if($result_id)
	{
		$aRow = hsl_xmlmc_rowo($result_id);
		if($aRow)
		{
			$returnvalue = $aRow->lastactdatex;
		}
	}

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/call/getlastupdatedate/index.php","END","SERVI");
	}	

	echo $returnvalue;
	exit;
?>