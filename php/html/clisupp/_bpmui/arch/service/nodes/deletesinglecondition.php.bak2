<?php

	//-- will delete a stage and all its related data

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

	//-- get passed in key
	$cid = gv("key");

	//-- get next seq - we can use this to id stage after insert
	$rs = new SqlQuery();
	$rs->Query("delete from bpm_cond where pk_condition_id = ".pfs($cid));
	if($rs->result)
	{
		$rs->Reset();
		$rs->Query("delete from bpm_cond_vpme where fk_cond_id = ".pfs($cid));
		if($rs->result)
		{
			echo "OK";
			exit(0);
		}
	}
	echo "Delete condition process failed. Please contact your Administrator";
?>