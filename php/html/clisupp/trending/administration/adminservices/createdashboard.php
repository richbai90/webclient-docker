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


	$iDID = trim($_POST["h_title"]);
	if($iDID=="")
	{
		echo generateCustomErrorString("-777","Please specify a dashboard to create",true);
		exit(0);
	}

	$rsNew = create_dashboard($_POST["gid"], $_POST["h_title"],$_POST["h_layout"],$_POST["h_access"],$_POST["h_owner"],$_POST["h_uidaccess"],$_POST["h_uraccess"]);
	if($rsNew && $rsNew->Fetch())
	{
		echo '{"h_dashboard_id":'.$rsNew->GetValueAsNumber("h_dashboard_id").'}';
	}
	else
	{
		echo generateCustomErrorString("-777","Failed to create new dashboard [".$_POST["h_title"]."]. Please contact your Administrator.",true);
	}
	exit(0);
?>
