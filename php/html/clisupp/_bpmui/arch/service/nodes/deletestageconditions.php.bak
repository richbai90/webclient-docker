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
	$boolOK = true;
	$sid = gv("key");

	//-- get next seq - we can use this to id stage after insert
	$rs = new SqlQuery();
	$rs->Query("SELECT PK_CONDITION_ID FROM BPM_COND WHERE FLG_RUNATSTART != 1 AND FK_STAGE_ID = ".pfs($sid));
	while($rs->Fetch())
	{
		$cid = $rs->GetValueAsNumber("pk_condition_id");
		//-- get next seq - we can use this to id stage after insert
		$delrs = new SqlQuery();
		$delrs->Query("DELETE FROM BPM_COND WHERE PK_CONDITION_ID = ".pfs($cid));
		if($delrs->result)
		{
			$delrs->Reset();
			$delrs->Query("DELETE FROM BPM_COND_VPME WHERE FK_COND_ID = ".pfs($cid));
			if(!$delrs->result)
			{
				$boolOK = false;
			}
		}
		else
		{
			$boolOK = false;
		}
	}
	


	if($boolOK)
	{
		echo "OK";
	}
	else
	{
		echo "Delete stage conditions failed. Please contact your Administrator";
	}
?>