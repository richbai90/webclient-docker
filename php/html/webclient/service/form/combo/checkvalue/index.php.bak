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
	if($strTxt=="")$strTxt = $strKey;

	$strMode = $_POST["checkmode"];
	if($strMode=="")$strMode="key";
	//-- value and text to check
	$strCheckValue= $_POST["checkvalue"];


	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/combo/checkvalue/index.php","START","SERVI");
	}	

	//-- prepare check filter
	$strCheckFilter = "";
	if($strMode=="key")
	{
		//-- find by distinct key value
		if(boolColumnIsString($strTable.".".$strKey))
		{
			$strCheckFilter .= " where " . $strKey ." = '" . db_pfs($strCheckValue) ."'";
		}
		else
		{
			$strCheckFilter .= " where " . $strKey ." = " . $strCheckValue;
		}
	}
	else
	{
		//-- pfs text?
		if(boolColumnIsString($strTable.".".$strTxt))
		{
			$strCheckFilter .= " where " . $strTxt . " = '" . db_pfs($strCheckValue) ."'";
		}
		else
		{
			$strCheckFilter .= "where ". $strTxt . " = " . $strCheckValue;
		}
	}

	$strFilter = $strCheckFilter;
	$strSQL = "select distinct ".$strKey ." as keycol, ". $strTxt ." as textcol from ".$strTable.$strFilter;
	$strResult= "";
	
	$bSystemDB = isSystemDB($strDSN);
	$oConn = connectdb($strDSN,$bSystemDB);
	if($oConn)
	{
		$result_id = _execute_xmlmc_sqlquery($strSQL,$oConn);
		$rows =hsl_xmlmc_rowo($result_id);
		if($rows)
		{
			$strResult= $rows->keycol."^swwc^".$rows->textcol;
		}
	}
	@close_dbs();

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/combo/checkvalue/index.php","END","SERVI");
	}	

	echo $strResult;
?>