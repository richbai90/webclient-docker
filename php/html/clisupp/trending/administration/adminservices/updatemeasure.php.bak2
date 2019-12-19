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


	$iMID = trim($_POST["h_id"]);
	if($iMID=="")
	{
		echo generateCustomErrorString("-777","Please specify a measure to update",true);
		exit(0);
	}

	$arrUpdateFields = Array();

	//-- basic fields that are stored against measure - that we allow for update
	//$arrUpdateFields[]="h_id.n";
	$arrUpdateFields[]="h_title";
	$arrUpdateFields[]="h_frequency_type";
	$arrUpdateFields[]="h_frequency.n";
	//$arrUpdateFields[]="h_actual.n";
	//$arrUpdateFields[]="h_difference.n";
	$arrUpdateFields[]="h_threshold.n";
	$arrUpdateFields[]="h_highisgood.n";
	$arrUpdateFields[]="h_trendlimit.n";
	$arrUpdateFields[]="h_unittype";
	$arrUpdateFields[]="h_owner";
	$arrUpdateFields[]="h_drilldownprovider";
	$arrUpdateFields[]="h_dataprovider";
	$arrUpdateFields[]="h_maxsamples_tostore.n";

	$arrUpdateFields[]="h_sampleon_table";
	$arrUpdateFields[]="h_sampleon_keycolname";
	$arrUpdateFields[]="h_sampleon_valcolname";
	$arrUpdateFields[]="h_sampleon_mathfunc";
	$arrUpdateFields[]="h_sampleon_datecolname1";
	$arrUpdateFields[]="h_sampleon_datecolname2";
	$arrUpdateFields[]="h_sampleon_whereclause";
	$arrUpdateFields[]="h_sampleon_savecols";
	$arrUpdateFields[]="h_sampleon_colwhere";

	$arrUpdate = Array();
	foreach($arrUpdateFields as  $fldName)
	{
		$arrInfo = explode(".",$fldName);
		$fldName = $arrInfo[0];
		$ctype = $arrInfo[1];

		if(isset($_POST[$fldName])) 
		{	
			$strUpdateFieldSql = $fldName . "= '" . pfs($_POST[$fldName]) ."'";
			if($ctype=="n") $strUpdateFieldSql = $fldName . "= " . pfs($_POST[$fldName]);
			else if($ctype=="strtotime")$strUpdateFieldSql = $fldName . "= " .strtotime(pfs($_POST[$fldName]));

			$arrUpdate[]= $strUpdateFieldSql;
		}
	}

	if(count($arrUpdate)==0)
	{
		echo generateCustomErrorString("-777","There are no fields to update. Please contact your Administrator",true);
		exit(0);
	}

	$strSQL = "update h_dashboard_measures set ".implode(",",$arrUpdate)." where h_id = ". pfs($iMID);
	echo sqlAsJson($strSQL,"sw_systemdb");
	exit(0);
	

	exit(0);
?>
