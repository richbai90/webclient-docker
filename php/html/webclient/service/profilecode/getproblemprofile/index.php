<?php
	//-- 1.0.0
	//-- \service\profilecode\getproblemprofile

	//-- given probcode path will return xml string of record detail i.e. desciption, sla, scriptid


	//-- check session
	include("../../../php/session.php");

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/profilecode/getproblemprofile/index.php","START","SERVI");
	}

	//--
	//-- connect to swdata - get profile codes
	$swdata = connectdb("swdata");


	//-- select data
	$strSelect = "select * from pcinfo where code= '" . $_POST['profilecode'] ."'";
	$res = _execute_xmlmc_sqlquery($strSelect,$swdata);
	$strXML = "<profilecode>";
	$row = hsl_xmlmc_rowo($res);
	if($row)
	{
		foreach($row  as $fieldName => $fieldValue)
		{
			$strXML .= "<".$fieldName.">" . pfx($fieldValue) . "</".$fieldName.">";
		}
	}
	close_dbs();
	$strXML .= "</profilecode>";
	echo $strXML;

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/profilecode/getproblemprofile/index.php","END","SERVI");
	}
?>
