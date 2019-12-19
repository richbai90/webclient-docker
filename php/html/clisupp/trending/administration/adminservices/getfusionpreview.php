<?php

	$chartXml = $_POST["xml"];
	$strDataFetchInclude =  $_POST["dp"];
	$intSimpleMeasureID =  $_POST["mid"];

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
		echo "The Supportworks ESP session id was not found. Please contact your Administrator";
		exit(0);
	}

	//-- check if admin - wil lexit if not
	exit_ifnot_administrator();

	if($strDataFetchInclude!="")
	{
		include("../../".$strDataFetchInclude);
	}
	else if($intSimpleMeasureID>0)
	{

		//-- we want to run chart off measured data - so select measure results for the # of samples they want to show
		$numSamples = $_POST["sc"];

		$rsMeasure = get_measurerecord($intSimpleMeasureID);
		$rsSample = get_measurerecord_samples($intSimpleMeasureID,$numSamples);
		if($rsSample && $rsMeasure)
		{
			//-- get the sample record so we can get the sample period (to create labelss i.e. monthly = dec, jan etc
			$rsMeasure->Fetch();
			$periodType = $rsMeasure->GetValueAsString("h_frequency_type");
			$unitType = $rsMeasure->GetValueAsString("h_unittype");
			$fusiondata = get_fusion_sampledataset($rsSample, $periodType, $unitType);
			$fusionData = &$fusiondata;
		}
	}
	else
	{
		//-- using simple sql grouping
		$rs = new SqlQuery();
		$fusiondata = $rs->GenerateFusionData($_POST["groupcol"],$_POST["countcol"],$_POST["sqltable"],$_POST["sqlwhere"],$_POST["sqldir"],"swdata",$_POST["sqllimit"]);
		$fusionData = &$fusiondata;
	}

	$matches = Array();
	$pattern = '%\:\[(.*?)\]%'; 
	preg_match_all($pattern, $chartXml, $matches);
	foreach($matches[0] as $key =>$match)
	{
		$search = $match;
		$varName = $matches[1][$key];
		$replaceVal = (isset(${$varName}))?${$varName}:"";

		$chartXml = str_replace($search,$replaceVal,$chartXml);
	}
	echo $chartXml;
	exit;

?>