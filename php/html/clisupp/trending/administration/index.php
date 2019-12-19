<?php

	include("../services/data.helpers.php"); //-- xmlmethocall & sqlquery classes
	include("../services/dashboard.helpers.php");


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

	$includefile = $_GET['pageid'] . ".php";
	if(!file_exists($includefile))
	{
		echo "The administration option [". $_GET['pageid']."] does not exist.";
		exit(0);
	}

	include($includefile);
?>