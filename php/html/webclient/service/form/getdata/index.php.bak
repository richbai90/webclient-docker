<?php

	//-- includes
	include('../../../php/session.php');
	include('../../../php/xml.helpers.php');
	include('../../../php/db.helpers.php');

	error_reporting(E_ERROR);

	/* passed in is:-
	
			_mastertable,_masterdsn,_mastervalue,_masterkeycol,_masterpfs
			_extendedtable,_extendedkeycol
			_relatedtable_#,_relatedkeycol_#,_relatedpfs_#,_relatedforeigncol_#
	*/

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/getdata/index.php","START","SERVI");
	}	

	//-- get master table info
	$strDSN = $_POST['_masterdsn'];
	if($strDSN=="")$strDSN ="swdata";
	$strTable = $_POST['_mastertable'];
	$strKeyCol = $_POST['_masterkeycol'];
	$intPFS = $_POST['_masterpfs'];


	if($strDSN=="sw_calendar")$strTable .= $oAnalyst->analystid;

	//-- is primary table on opencall
	$boolIssues = (strToLower($strTable)=="swissues");
	$boolOpencall = (strToLower($strTable)=="opencall");
	//-- or calltasks
	$boolCalltasks = (strToLower($strTable)=="calltasks");
	$boolTempCalltasks = (strpos($strTable,"_calltasks")!==false)?true:false;

	//-- get passed in record key and construct where
	$varRecordKey = $_POST['_mastervalue'];

	if($boolCalltasks || $boolTempCalltasks)
	{
		$arrRecordKey = explode(":",$varRecordKey);
		if($boolTempCalltasks)
		{
			$strWhere ="taskid =".$arrRecordKey[0]." and parentgroup = '". db_pfs($arrRecordKey[1])."'";
		}
		else
		{
			$strWhere ="taskid =".$arrRecordKey[0]." and callref = ". $arrRecordKey[1];
		}
	}
	else
	{
		if($intPFS=="1")$varRecordKey = "'".db_pfs($varRecordKey,$portal->databasetype)."'";
		$strWhere = $strKeyCol ."=".$varRecordKey;
	}

	//-- get primary record - if opencall try cache first then swdata
	$strSQL = "select * from ".$strTable." where ".$strWhere;
	if($boolIssues || $boolOpencall || $boolCalltasks || $boolTempCalltasks)
	{
		$strDSN = "syscache";
		$oSysConn = connectdb("syscache",true);
		$rsPri = _xmlmc_query_record($strSQL,$oSysConn);
		if($rsPri==false)
		{
			//-- connect to swdata
			$oConn = connectdb("swdata",false);
			$rsPri = _xmlmc_query_record($strSQL,$oConn);
		}
	}
	else
	{
		$oConn = connectdb($strDSN);
		$rsPri = _xmlmc_query_record($strSQL,$oConn);
	}

	if($boolTempCalltasks)$strTable = "calltasks";
	$strXMLRS .= db_record_as_xml($rsPri,$strTable,$strKeyCol,$strTable,$intPFS,true,true);

	$oConn = connectdb("swdata",false);
	
	//-- process extended table
	if(isset($_POST['_extendedtable']))
	{
		$strExtDSN ="swdata";
		$strExtTable = $_POST['_extendedtable'];
		$strExtKeyCol = $_POST['_extendedkeycol'];

		$strExtWhere = $strExtKeyCol ."=".$varRecordKey;

		//-- get ext record
		$strSQL = "select * from ".$strExtTable." where ".$strExtWhere;
		$rsExt = _xmlmc_query_record($strSQL,$oConn);
		$strXMLRS .= db_record_as_xml($rsExt,$strExtTable,$strExtKeyCol,$strExtTable,$intPFS,true);
	}

	//-- process any related tables
	$strRelDSN ="swdata";
	foreach($_POST as $strParamName => $varParamValue)
	{
		
		$arrInfo = explode("_relatedtable",$strParamName);
		if($arrInfo[0] == "")
		{
			$intTableNo = $arrInfo[1];

			$strRelTable = $_POST['_relatedtable'.$intTableNo];
			$strKeyRelCol = $_POST['_relatedkeycol'.$intTableNo];
			$strKeyForCol = $_POST['_relatedforeigncol'.$intTableNo];

			//echo 
			//echo $strKeyForCol .":".$rsPri->$strKeyForCol.":".$intRelPFS;

			$intRelPFS = $_POST['_relatedpfs'.$intTableNo];

			$varRelColValue = $rsPri->$strKeyForCol;
			if($intRelPFS=="1")	$varRelColValue = "'".db_pfs($varRelColValue,$portal->databasetype)."'";
			$strRelWhere = $strKeyRelCol ."=".$varRelColValue;
			
			//-- get ext record
			$strSQL = "select * from ".$strRelTable." where ".$strRelWhere;

			$rsRel = _xmlmc_query_record($strSQL,$oConn);
			$strXMLRS .= db_record_as_xml($rsRel,$strRelTable,"",$strRelTable,$intPFS,true);

		}
	}
	
	close_dbs();

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/form/getdata/index.php","END","SERVI");
	}	


	$strXML = "<formdata>";
	$strXML .= $strXMLRS;
	$strXML .= "</formdata>";

	echo $strXML;
?>