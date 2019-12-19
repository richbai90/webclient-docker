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
	$rs->Query("select pk_condition_id bpm_cond where flg_runatstart = 1 and fk_stage_id = ".pfs($sid));
	if($rs->result)
	{
		while($rs->Fetch())
		{
			$cid = $rs->GetValueAsNumber("pk_condition_id");
			//-- get next seq - we can use this to id stage after insert
			$delrs = new SqlQuery();
			$delrs->Query("delete from bpm_cond where pk_condition_id = ".pfs($cid));
			if($delrs->result)
			{
				$delrs->Reset();
				$delrs->Query("delete from bpm_cond_vpme where fk_cond_id = ".pfs($cid));
				if(!$rs->result)
				{
					$boolOK = false;
				}
			}
			else
			{
				$boolOK = false;
			}
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