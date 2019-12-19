<?php

	//-- will create a new stage and link it to stage condition that add stage was selected from

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


	//-- get next seq - we can use this to id stage after insert
	$rs = new SqlQuery();
	$rs->Query("select max(seq) as seq from bpm_stage where fk_workflow_id = '".pfs(gv("wid"))."'");
	if($rs->Fetch())
	{
		$nextSeq = $rs->GetValueAsNumber("seq") + 1;

		//-- create a new - empty stage
		$rs->Reset();
		$rs->Query("insert into bpm_stage (fk_workflow_id,title,seq) values ('".pfs(gv("wid"))."','First Stage',".$nextSeq.")");
		if($rs->result)
		{
			//-- now update bpm_workflow.fk_firststage_id
			$rs->Reset();
			$rs->Query("select pk_stage_id from bpm_stage where fk_workflow_id = '".pfs(gv("wid"))."' and title='First Stage' and seq = ".$nextSeq);
			if($rs->Fetch())
			{
				$newStageID = $rs->GetValueAsNumber("pk_stage_id");

				$rs->Reset();
				$rs->Query("update bpm_workflow set fk_firststage_id = ".$newStageID." where pk_workflow_id = '".pfs(gv("wid"))."'");
				if($rs->result)
				{
					echo "stage_".$newStageID;
					exit(0);
				}
			}
		}
	}
	echo "The add first stage process failed. Please contact your Administrator";
?>