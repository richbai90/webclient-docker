<?php

	//-- 28.04.2010 - display call attachments
	//-- 1.0.0
	//-- service/fileupload/callattachments.php
	$excludeTokenCheck = true;
	include('../../php/session.php');

	if($_POST['_callref']=="")
	{
		echo "<files></files>";
	}

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/fileupload/callattachments.php","START","SERVI");
	}	

	//--
	//-- connect to syscache - get profile codes
	$sysdb = connectdb("swcache");

	//-- cols
	$arrCols = Array();
	$arrCols["0"] = "filename";
	$arrCols["1"] = "sizeu";
	$arrCols["2"] = "filename";
	$arrCols["3"] = "timeadded";
	$arrCols["4"] = "addedby";

	//-- ordering
	$iOrderBy = (@$_POST['_orderby']=="")?"3":$_POST['_orderby'];
	$strOrderDir = (@$_POST['_orderdir']=="")?"DESC":$_POST['_orderdir'];
	$strOrderBy=$arrCols[$iOrderBy];

	//-- select data
	$strSelect = "select * from system_cfastore where callref= " . $_POST['_callref'] ." order by ".$strOrderBy." " .$strOrderDir;
	$res = _execute_xmlmc_sqlquery($strSelect,$sysdb);
	$strXML = "<callfiles>";
	while($row = hsl_xmlmc_rowo($res))
	{
		$strXML .= "<file>";
		foreach($row  as $fieldName => $fieldValue)
		{
			if($fieldName=="sizeu")$fieldValue=conversion_bytesize($fieldValue);

			$strXML .= "<".$fieldName.">" . pfx($fieldValue) . "</".$fieldName.">";
		}
		$strXML .= "</file>";
	}
	$strXML .= "</callfiles>";

	close_dbs();
	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/fileupload/callattachments.php","END","SERVI");
	}	

	echo $strXML;
?>