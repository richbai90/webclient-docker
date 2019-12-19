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

	
	if(!isset($_POST['widgettemplatepath']))
	{
		echo "The widget template path is missing. Please contact your Administrator";
		exit;
	}
	
	echo @file_get_contents("../../".$_POST['widgettemplatepath']);
	exit(0);
?>
