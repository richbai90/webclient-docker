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

	$strTableRows = "";

	$rsAllSamples = get_measure_samples(pfs($_POST['mid']),"desc");
	
	
	switch ($_POST['ut'])
	{
		case "days":
			$intFactor = 86400;
			break;
		case "hrs":
			$intFactor = 3600;
			break;
		case "mins":
			$intFactor = 60;
			break;
		default:
			$intFactor = 1;
	}
	
	if($rsAllSamples)
	{
		while($rsAllSamples->Fetch())
		{
			$sampleValue = round($rsAllSamples->GetValueAsNumber("h_value") / $intFactor,1);
			$strTableRows.='<tr sid="'.$rsAllSamples->GetValueAsNumber("h_pk_sid").'"><td><button class="btn-delete-sample">delete this sample</button></td><td><input type="text" class="siddate" value="'.date("Y-m-d H:i:s",$rsAllSamples->GetValueAsNumber("h_sampledate")).'"/></td><td align="right"><input type="text" class="sidvalue" value="'.$sampleValue.'"/></td></tr>';
		}
	}
	echo $strTableRows;
	exit(0);
?>
