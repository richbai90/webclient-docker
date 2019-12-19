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

	
	if(!isset($_POST['dataprovider']))
	{
		echo "The widget data provider identifier is missing. Please contact your Administrator";
		exit;
	}

	swdti_load("default");

	include("../../".$_POST['dataprovider']);

	$xml = "<data>".$fusionData."</data>";
	$tablerows = "";
	$dom = domxml_open_mem(utf8_encode($xml));
	$root = $dom->document_element();
	$arrData = $root->get_elements_by_tagname("set");
	foreach($arrData as $node)
	{
		$tablerows .= "<tr>";
			$tablerows .= "<td>".xa($node,"label")."</td>";
			$tablerows .= "<td>".xa($node,"value")."</td>";
		$tablerows .= "</tr>";
	}

	echo $tablerows;

	exit(0);
?>
