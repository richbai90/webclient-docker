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
	$sid = gv("key");

	//-- get next seq - we can use this to id stage after insert
	$rs = new SqlQuery();
	$rs->Query("delete from bpm_stage where pk_stage_id = ".pfs($sid));
	if($rs->result)
	{
		//-- delete any stage conditions
		$rs->Reset();
		$rs->Query("delete from bpm_cond where fk_stage_id = ".pfs($sid));
		if($rs->result)
		{

			//-- delete any conditions that point/go to this stage
			$rs->Reset();
			$rs->Query("delete from bpm_cond where set_stage = ".pfs($sid));
			if($rs->result)
			{

				$rs->Reset();
				$rs->Query("delete from bpm_stage_sts where fk_stage_id = ".pfs($sid));
				if($rs->result)
				{
					$rs->Reset();
					$rs->Query("delete from bpm_stage_auth where fk_stage_id = ".pfs($sid));
					if($rs->result)
					{
						$rs->Reset();
						$rs->Query("delete from bpm_stage_task where fk_stage_id = ".pfs($sid));
						if($rs->result)
						{
							$rs->Reset();
							$rs->Query("delete from bpm_ctrl_fields where fk_stage_id = ".pfs($sid));
							if($rs->result)
							{
								echo "OK";
								exit(0);
							}
						}
					}
				}
			}
		}
	}
	echo "Delete stage process failed. Please contact your Administrator";
?>