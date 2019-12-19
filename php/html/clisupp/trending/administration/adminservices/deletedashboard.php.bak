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


	$intDelDashboard = trim($_POST["did"]);
	if($intDelDashboard=="")
	{
		echo generateCustomErrorString("-777","Please specify a dashboard to delete",true);
		exit(0);

	}

	$rsDeleted = delete_dashboard($intDelDashboard);
	if($rsDeleted)
	{
		echo '{"status":"OK"}';
		exit(0);
	}
	else
	{
		echo generateCustomErrorString("-777","Failed to delete the dashboard. Please contact your administrator",true);
		exit(0);
	}
?>
