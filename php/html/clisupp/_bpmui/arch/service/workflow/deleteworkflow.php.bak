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
	$wid = gv("wid");

	//-- get next seq - we can use this to id stage after insert
	$rs = new SqlQuery();
	$rs->Query("select count(*) as cnt from opencall where status < 16 and bpm_workflow_id = '".pfs($wid)."'");
	if($rs->Fetch() && $rs->GetValueAsNumber("cnt")>0)
	{
		echo "This workflow cannot be deleted as there are active requests in the system running against it.";
		exit();
	}

	
	$rs->Reset();
	$rs->Query("delete from bpm_cond where fk_workflow_id = '".pfs($wid)."'");
	if($rs->result)
	{
		$rs->Reset();
		$rs->Query("delete from bpm_cond_vpme where fk_workflow_id = '".pfs($wid)."'");
		if($rs->result)
		{
			$rs->Reset();
			$rs->Query("delete from bpm_stage_sts where fk_workflow_id = '".pfs($wid)."'");
			if($rs->result)
			{
				$rs->Reset();
				$rs->Query("delete from bpm_stage_task where fk_workflow_id = '".pfs($wid)."'");
				if($rs->result)
				{
					$rs->Reset();
					$rs->Query("delete from bpm_stage where fk_workflow_id = '".pfs($wid)."'");
					if($rs->result)
					{
						$rs->Reset();
						$rs->Query("delete from bpm_progress where fk_workflow_id = '".pfs($wid)."'");
						if($rs->result)
						{
							$rs->Reset();
							$rs->Query("delete from bpm_workflow where pk_workflow_id = '".pfs($wid)."'");
							if($rs->result)
							{
								echo "OK";
								exit();
							}
						}
					}
				}
			}
		}
	}
	echo "Delete workflow process failed. Please contact your Administrator";
?>