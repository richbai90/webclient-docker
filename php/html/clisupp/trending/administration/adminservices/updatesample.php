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


	$iSID = trim($_POST["sid"]);
	if($iSID=="")
	{
		echo generateCustomErrorString("-777","Please specify a sample to update",true);
		exit(0);
	}

	$arrUpdate = Array();
	if(isset($_POST["sampledate"])) $arrUpdate[]= "1";
	if(isset($_POST["samplevalue"])) $arrUpdate[]= "2";

	if(count($arrUpdate) == 0)
	{
		echo generateCustomErrorString("-777","There is nothing to update.",true);
		exit(0);
	}

	$rs = update_sample($iSID,strtotime($_POST["sampledate"]),$_POST["samplevalue"]);
	if($rs && $rs->Fetch())
	{
		update_measure_scorestats($rs->GetValueAsNumber("h_fk_measure"));
		echo '{"result":"OK"}';
	}
	else
	{
		echo generateCustomErrorString("-777","Failed to update sample data.",true);
	}

	exit(0);
?>
