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
	$rs->Query("SELECT MAX(SEQ) AS SEQ FROM BPM_STAGE WHERE FK_WORKFLOW_ID = '".pfs(gv("wid"))."'");
	if($rs->Fetch())
	{
		$nextSeq = $rs->GetValueAsNumber("seq") + 1;

		//-- create a new - empty stage
		$rs->Reset();
		$rs->Query("INSERT INTO BPM_STAGE (FK_WORKFLOW_ID,TITLE,SEQ) VALUES ('".pfs(gv("wid"))."','New Stage',".$nextSeq.")");
		if($rs->result)
		{
			//-- now create a new condition that links this new stage to the passed in stage
			$rs->Reset();
			$rs->Query("SELECT PK_STAGE_ID FROM BPM_STAGE WHERE FK_WORKFLOW_ID = '".pfs(gv("wid"))."' AND TITLE='New Stage' AND SEQ = ".$nextSeq);
			if($rs->Fetch())
			{
				$newStageID = $rs->GetValueAsNumber("pk_stage_id");
				$flgAtStart = (gv("ntype")=="startcond")?1:0;

				$rs->Reset();
				$rs->Query("SELECT MAX(PK_CONDITION_ID) AS SEQ FROM BPM_COND WHERE FK_WORKFLOW_ID = '".pfs(gv("wid"))."'");
				if($rs->Fetch())
				{
					$condPos = $rs->GetValueAsNumber("seq") + 1;
					$condTitle = "New Stage Link (".$condPos.") - Please Edit";
				}
				else
				{
					$condTitle = "New Stage Link - Please Edit";
				}


				$rs->Reset();
				$rs->Query("INSERT INTO BPM_COND (FLG_RUNATSTART, FK_WORKFLOW_ID,FK_STAGE_ID,TEST_CONDITION,TITLE,SET_WORKFLOW,SET_STAGE) VALUES (".$flgAtStart.",'".pfs(gv("wid"))."',".pfs(gv("sid")).",'1==2','".$condTitle."','".pfs(gv("wid"))."',".$newStageID.")");
				if($rs->result)
				{
					echo "stage_".$newStageID;
					exit(0);
				}
			}
		}
	}
	echo "The add new stage process failed. Please contact your Administrator";
?>