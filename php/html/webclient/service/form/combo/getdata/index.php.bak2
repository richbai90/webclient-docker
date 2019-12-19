<?php

	//-- includes
	include('../../../../php/session.php');
	include('../../../../php/db.helpers.php');

	//-- expect dsn, table and filter and keycol
	$strDSN = $_POST["dsn"];
	$strTable = $_POST["table"];
	$strFilter = $_POST["filter"];
	$strKey = $_POST["keycol"];
	$strTxt = $_POST["textcol"];
	$strMand = $_POST["mandatory"];
	$strOrderDesc = $_POST['orderdesc'];
	if($strTxt=="")$strTxt = $strKey;

	$strOrderDir = ($strOrderDesc=="true")?"DESC":"ASC";

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/combo/getdata/index.php","START","SERVI");
	}	

	//-- get data list - use distinct so don't get duplicates like in country lb running of manufact table
	if($strFilter!="")$strFilter = " where " . $strFilter;
	$strSQL = "select distinct ".$strKey ." as keycol, ". $strTxt ." as textcol from ".$strTable.$strFilter." order by textcol ".$strOrderDir;

	$bSystemDB = isSystemDB($strDSN);
	$oConn = connectdb($strDSN,$bSystemDB);

	// -- if we use our own control

	$strData = "<table border='0' cellpadding='0' cellspacing='0' width='100%'>";
	if($strMand=="0")
	{
		$strData .= "<tr><td width='100%'>&nbsp;</td><td style='display:none;'></td></tr>";
	}
	$result_id =_execute_xmlmc_sqlquery( $strSQL,$oConn);
	$rows =hsl_xmlmc_rowo($result_id);
	while($rows)
	{

		$strData .= "<tr><td noWrap >".htmlentities($rows->textcol)."</td><td style='display:none;'>".htmlentities($rows->keycol)."</td></tr>";
		$rows =hsl_xmlmc_rowo($result_id);
	}
	$strData.= "</table>";
		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/form/combo/getdata/index.php",$strData,"SERVI");
		}	
	

	close_dbs();

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/combo/getdata/index.php","END","SERVI");
	}	

	echo $strData;
	exit(0);
?>