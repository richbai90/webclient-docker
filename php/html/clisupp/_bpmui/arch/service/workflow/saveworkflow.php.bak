<?php

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

	//-- see if we graphxml have it stored in db
	$rs = new SqlQuery();
	if(!$rs->Query("UPDATE BPM_WORKFLOW SET GRAPHXML='".pfs(gv("graphxml"))."' WHERE PK_WORKFLOW_ID = '".pfs(gv("wid"))."'"))
	{
		echo $rs->GetLastError();
	}
	exit(0);
?>
