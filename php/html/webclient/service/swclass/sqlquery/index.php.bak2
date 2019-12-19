<?php

	//-- v1.0.0
	//-- service/swclass/sqlquery

	//-- given sql and db execute and return result set
	include("../../../php/session.php");

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/swclass/sqlquery/index.php","START","SERVI");
	}

	$strSQL = $_POST['execsql'];
	$strDSN = $_POST['db'];
	$strDelete = $_POST['delete'];
	if($strDSN=="")$strDSN="swdata";
	if($strDSN=="swcache" || $strDSN=="syscache") $strDSN="sw_systemdb";
	//--
	//-- 15.05.2012 - nwj return data as json
	$xml = '<methodCall service="data" method="sqlQuery">';
	$xml.= '<params>';
	$xml.= '<database>'.$strDSN.'</database>';
	$xml.= '<query>'._pfx($strSQL).'</query>';
	$xml.= '<formatValues>true</formatValues>';
	$xml.= '<returnMeta>true</returnMeta>';
	$xml.= '<returnRawValues>true</returnRawValues>';
	$xml.= '</params>';
	$xml.= '</methodCall>';
	
	$oResult = xmlmc("localhost", 5015, $_SESSION['swstate'], $xml,true);
	$_SESSION['swstate'] = $oResult->token;
	echo $oResult->content;
	exit(0);

	
	//-- old method using custom xml format
	if($strDSN=="sw_systemdb")$strDSN="swcache";
	$oConn = connectdb($strDSN,$bSystemDB);

	$strXMLRS = "<?xml version=\"1.0\"?><resultset status='ok'>";

	$result_id = _execute_xmlmc_sqlquery($strSQL,$oConn); 
	if($result_id && $strDelete=="")
	{
		//-- get row
		$aRow = hsl_xmlmc_rowo($result_id);
		while($aRow)
		{
			$strXMLRS .= db_record_as_xmlmc($aRow,"row","","",0);
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
		_wc_debug("service/swclass/sqlquery/index.php","END","SERVI");
	}

	echo $strXMLRS;
?>