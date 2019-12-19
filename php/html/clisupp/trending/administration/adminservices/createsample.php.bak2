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


	$measureID = $_POST["mid"];
	if($measureID=="")
	{
		echo generateCustomErrorString("-777","Please specify a measure id against which to create a dummy sample",true);
		exit(0);
	}

	$rsNew = create_sample($_POST["sampledate"], $_POST["samplevalue"],$measureID);
	if($rsNew && $rsNew->Fetch())
	{
		update_measure_scorestats($measureID);
		//--
		//-- we have created a new sample so update the measure - get the last 2 samples so we can work out the change
		echo '{"h_mid":'.$rsNew->GetValueAsNumber("h_pk_sid").',"h_sampledate":"'. date("Y-m-d H:i:s",$rsNew->GetValueAsNumber("h_sampledate")).'","h_value":'.$rsNew->GetValueAsNumber("h_value").'}';
	}
	else
	{
		echo generateCustomErrorString("-777","Failed to create new sample. Please contact your Administrator.",true);
	}
	
?>