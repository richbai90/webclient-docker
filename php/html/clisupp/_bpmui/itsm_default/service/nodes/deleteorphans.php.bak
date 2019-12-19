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

	//error_reporting(E_ERROR);

	//-- get workflow first stage id
	$rs=new SqlQuery();
	$arrSetStages = Array();
	$rs->Query("select fk_firststage_id from bpm_workflow where pk_workflow_id = '".pfs($wid)."'");
	if($rs->Fetch())
	{
		$arrSetStages["s".$rs->GetValueAsString("fk_firststage_id")] = true;
	}


	//-- get all stages for workflow - then get all conditions and for any stage (apart from the first one) that does not have a set_stage in one of he conditions is an orphan.
	$rs->reset();
	$rs->Query("select set_stage from bpm_cond where fk_workflow_id = '".pfs($wid)."'");
	while($rs->Fetch())
	{
		$arrSetStages["s".$rs->GetValueAsString("set_stage")] =true;
	}

	$unlinkedStages = "";
	$rs->reset();
	$rs->Query("select pk_stage_id from bpm_stage where fk_workflow_id = '".pfs($wid)."'");
	while($rs->Fetch())
	{
		$stageID = $rs->GetValueAsString("pk_stage_id");
		if(!isset($arrSetStages["s".$stageID]))
		{
			if($unlinkedStages!="") $unlinkedStages .= ",";
			$unlinkedStages .= $stageID;
		}
	}	

	if($unlinkedStages == "")
	{
		echo "OK";
		exit(0);
	}

	//-- get next seq - we can use this to id stage after insert
	$rs = new SqlQuery();
	$rs->Query("delete from bpm_stage where pk_stage_id in (".pfs($unlinkedStages).")");
	if($rs->result)
	{
		//-- delete any stage conditions
		$rs->Reset();
		$rs->Query("delete from bpm_cond where fk_stage_id in (".pfs($unlinkedStages).")");
		if($rs->result)
		{
			//-- delete stage cond vpme links
			$rs->Reset();
			$rs->Query("delete from bpm_cond_vpme where fk_stage_id in (".pfs($unlinkedStages).")");

			//-- delete any conditions that point/go to this stage
			$rs->Reset();
			$rs->Query("delete from bpm_cond where set_stage in (".pfs($unlinkedStages).")");
			if($rs->result)
			{
				$rs->Reset();
				$rs->Query("delete from bpm_stage_sts where fk_stage_id in (".pfs($unlinkedStages).")");
				if($rs->result)
				{
					$rs->Reset();
					$rs->Query("delete from bpm_stage_auth where fk_stage_id in (".pfs($unlinkedStages).")");
					if($rs->result)
					{
						$rs->Reset();
						$rs->Query("delete from bpm_stage_task where fk_stage_id in (".pfs($unlinkedStages).")");
						if($rs->result)
						{
							$rs->Reset();
							$rs->Query("delete from bpm_ctrl_fields where fk_stage_id in (".pfs($unlinkedStages).")");
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