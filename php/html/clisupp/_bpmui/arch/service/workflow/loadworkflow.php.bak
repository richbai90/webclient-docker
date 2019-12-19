<?php

	include("../../config.php");
	include("../data.helpers.php"); //-- xmlmethocall & sqlquery classes


	//-- get session id and bind - if no session id exit
	$sessionID = gv("sessid");
	if($sessionID!=null)
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


	//--
	//-- given workflow id load its graph - if graph does not exist then we need to generate graph first and then return
	$strXmlGraphData = "";

	//-- see if we graphxml have it stored in db
	$rs = new SqlQuery();
	$rs->Query("SELECT GRAPHXML FROM BPM_WORKFLOW WHERE PK_WORKFLOW_ID = '".pfs(gv("wid"))."'");
	if($rs->Fetch())
	{
		$strXmlGraphData = $rs->GetValueAsString("graphxml");		
	}

	//-- if not set we need to generate it
	//error_reporting(E_ERROR);
	include("../bpmui.helpers.php");
	$strXmlGraphData = export_workflow_to_graph(gv("wid"),$strXmlGraphData); //-- pass in existing graph to merge

	echo $strXmlGraphData;
	exit(0);
?>
