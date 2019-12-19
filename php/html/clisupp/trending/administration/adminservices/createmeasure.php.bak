<?php

	include("../../services/data.helpers.php"); //-- xmlmethocall & sqlquery classes
	include("../../services/dashboard.helpers.php");

	$sessionID = gv("sessid");
	if(isset($_COOKIE['ESPSessionState']))
	{
		$_core['_nexttoken'] = $_COOKIE['ESPSessionState'];
	}
	else if($sessionID!=null)
	{
		//-- bind session
		$xmlmc = new XmlMethodCall();
		$xmlmc->SetParam("sessionId",$sessionID);
		if(!$xmlmc->invoke("session","bindSession"))
		{
			echo $xmlmc->xmlresult;
			exit(0);
		}
	}
	else
	{
		echo generateCustomErrorString("-777","The Supportworks ESP session id was not found. Please contact your Administrator",true);
		exit(0);
	}

	//-- check if admin - wil lexit if not
	exit_ifnot_administrator();



	$arrInsertFields = Array();

	//-- basic fields that are stored against measure - that we allow for update
	//$arrUpdateFields[]="h_id.n";
	$arrInsertFields[]="h_title";
	$arrInsertFields[]="h_frequency_type";
	$arrInsertFields[]="h_frequency.n";
	//$arrUpdateFields[]="h_actual.n";
	//$arrUpdateFields[]="h_difference.n";
	$arrInsertFields[]="h_threshold.n";
	$arrInsertFields[]="h_highisgood.n";
	$arrInsertFields[]="h_trendlimit.n";
	$arrInsertFields[]="h_unittype";
	$arrInsertFields[]="h_owner";
	$arrInsertFields[]="h_drilldownprovider";
	$arrInsertFields[]="h_dataprovider";
	$arrInsertFields[]="h_maxsamples_tostore.n";
	$arrInsertFields[]="h_sampleon_table";
	$arrInsertFields[]="h_sampleon_keycolname";
	$arrInsertFields[]="h_sampleon_valcolname";
	$arrInsertFields[]="h_sampleon_mathfunc";
	$arrInsertFields[]="h_sampleon_datecolname1";
	$arrInsertFields[]="h_sampleon_datecolname2";
	$arrInsertFields[]="h_sampleon_whereclause";
	$arrInsertFields[]="h_sampleon_savecols";
	$arrInsertFields[]="h_sampleon_colwhere";

	$arrInsertCols = Array();
	$arrInsertValues = Array();
	foreach($arrInsertFields as  $fldName)
	{
		$arrInfo = explode(".",$fldName);
		$fldName = $arrInfo[0];
		$ctype = $arrInfo[1];

		if(isset($_POST[$fldName])) 
		{	
			$arrInsertCols[] = $fldName;
			$strValue = "'" . pfs($_POST[$fldName]) ."'";
			if($ctype=="n") $strValue = pfs($_POST[$fldName]);
			else if($ctype=="strtotime")$strValue = strtotime(pfs($_POST[$fldName]));

			$arrInsertValues[]= $strValue;
		}
	}

	if(count($arrInsertValues)==0)
	{
		echo generateCustomErrorString("-777","There are no fields to insert. Please contact your Administrator",true);
		exit(0);
	}

	$strSQL = "insert into h_dashboard_measures (".implode(",",$arrInsertCols).") values(".implode(",",$arrInsertValues).")";
	$rs = new SqlQuery();
	if($rs->Query($strSQL,"sw_systemdb"))
	{
		echo get_measurerecord_bytitle($_POST["h_title"],true);
	}
	else
	{
		echo generateCustomErrorString("-777","Failed to create new measure record. Please contact your Administrator",true);
	}

	exit(0);
	


?>
