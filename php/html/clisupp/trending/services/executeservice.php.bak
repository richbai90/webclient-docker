<?php


include("data.helpers.php"); //-- xmlmethocall & sqlquery classes
include("dashboard.helpers.php");

error_reporting(E_ALL);

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

//-- check we have a passed in group id and portal id (this will give us the dashboard configuration to load
if(!isset($_POST['wid']))
{
	echo "The widget configuration identifier is missing. Please contact your Administrator";
	exit;
}


$rsWidget = get_widgetrecord($_POST['wid']);
if($rsWidget->Fetch())
{
	$strType =  $rsWidget->GetValueAsString("h_type");
	$strServiceInclude = "../widgets/";
	switch($strType)
	{
		case "fusion":
			$strServiceInclude .= "fusioncharts/renderchart.php";
			break;
		case "scorecard":
			$strServiceInclude .= "scorecard/rendercard.php";
			break;
		case "custom":
			$strServiceInclude .= "phpcontent/rendercontent.php";
			break;
	}

	swdti_load("default");
	include($strServiceInclude);
}
?>