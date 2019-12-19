<?php

	include('../../php/session.php');

	//-- given table name and callref add any work items to calltasks using hdsession
	if($_POST['_callref']!="" && $_POST['_table']!="")
	{

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/attach_call_workflow.php","START","SERVI");
		}
	
		//-- connect to temp db
		$tempdb = connectdb('sw_systemdb');
		if(!$tempdb)
		{
			echo "Could not access system database."; 
			exit;
		}


		//-- select workflow records from temp db
		$strSelect = "select * from wc_calltasks where sessionid = '".db_pfs($_POST['_table'])."' order by parentgroupsequence,taskid asc";
		$result_id = _execute_xmlmc_sqlquery($strSelect, $tempdb);
		if(!$result_id)
		{
			close_dbs();
			echo "Could not access temporary workflow table items."; 
			exit;
		}

		//-- create recordset and loop through
		$aRow = hsl_xmlmc_rowo($result_id,false);

		//-- connect to temp db
		$sysdb = connectdb('sw_systemdb',true);
		if(!$sysdb)
		{
			echo "Could not access system database."; 
			exit;
		}


		//-- get max pgs for call
		$iCurrMaxPGS = 0;
		$strCallSelectPGS = "select max(parentgroupsequence) as pgs from calltasks where callref = ".$_POST["_callref"];
		$res = _execute_xmlmc_sqlquery($strCallSelectPGS, $sysdb);
		if($res)
		{
			$callPGSRow = hsl_xmlmc_rowo($res);
			if($callPGSRow)
			{
				$iCurrMaxPGS = $callPGSRow->pgs;
			}
		}
		else
		{
			close_dbs();
			echo " couldnt not get max pgs";
			exit;
		}
		if($iCurrMaxPGS=="")$iCurrMaxPGS=-1;
		
		$iAddFlag = 0;
		$strCurrGroup = "";
		while($aRow)
		{

			if($aRow->taskid==0)
			{
				//-- a group header - check flag to see if tasks should be sequential
				if($aRow->flags==4104)
				{
					$iAddFlag = 8;
				}
				else
				{
					$iAddFlag = 0;
				}
			}
			else
			{

					if($strCurrGroup!=$aRow->parentgroup)
					{
						$iCurrMaxPGS++;
						$iNextPGS = $iCurrMaxPGS;

						$bUseCurrPGS = true;
						//-- check if adding as part of existing group - so get pgs if exists
						$strSelectPGS = "select max(parentgroupsequence) as pgs from calltasks where parentgroup = '".db_pfs($aRow->parentgroup)."' and callref = ".$_POST["_callref"];
						$res = _execute_xmlmc_sqlquery($strSelectPGS, $sysdb);
						if($res)
						{
							$aPGSRow = hsl_xmlmc_rowo($res);
							if($aPGSRow)
							{
								if($aPGSRow->pgs!="")
								{
									//echo $aRow->parentgroup .":".$aPGSRow->pgs;
									$iNextPGS = $aPGSRow->pgs;
									$iCurrMaxPGS--;
								}
							}
						}
						else
						{
							close_dbs();
							echo "could not query calltasks table for next sequence.";
							exit;
						}

						$strCurrGroup=$aRow->parentgroup;

					}
					//-- if no record then use one from temp record

					//-- check if flag has 8 in it - if so and iAddFlag = 0 then remove the 8
					//-- if does not have 8 in it and iAddFlag = 8 then add it
					if(($aRow->flags & 8) && ($iAddFlag==0))
					{
						//-- remove the 8
						$aRow->flags = $aRow->flags-8;
					}
					else if (!($aRow->flags & 8) && ($iAddFlag==8))
					{
						//-- add 8
						$aRow->flags = $aRow->flags+8;
					}

					//-- ?? no where in xmlmc to set sequence of task ??
					$boolSequential = ($aRow->flags & (1 << 8));			
					
					//-- action by flag
					$actionByFlag = 0;
					if ($aRow->flags & (1 << 0))				
					{
						$actionByFlag = 0;
					}
					else if ($aRow->flags & (1 << 1))				
					{
						$actionByFlag = 1;
					}
					else if ($aRow->flags & (1 << 2))				
					{
						$actionByFlag = 2;
					}
					
					$xmlmc = new XmlMethodCall();
					$xmlmc->SetParam("callref",$_POST["_callref"]);
					$xmlmc->SetParam("parentGroup",$aRow->parentgroup);
					$xmlmc->SetParam("description",$aRow->details);
					$xmlmc->SetParam("time",$aRow->compltbyx);
					$xmlmc->SetParam("assignToGroup",$aRow->groupid);
					if($aRow->analystid)$xmlmc->SetParam("assignToAnalyst",$aRow->analystid);
					$xmlmc->SetParam("actionBy",$actionByFlag);
					$xmlmc->SetParam("priority",$aRow->priority);
					$xmlmc->SetParam("type",$aRow->type);
					if($aRow->notifytime)$xmlmc->SetParam("reminder",$aRow->notifytime);
					$xmlmc->SetParam("remindAssignee",($aRow->flags & (1 << 10)));
					$xmlmc->SetParam("remindCallOwner",($aRow->flags & (1 << 20)));
					$xmlmc->SetParam("notifyGroup",($aRow->flags & (1 << 40)));
					
					if(!$xmlmc->invoke("helpdesk","addCallWorkItem"))
					{
						echo $xmlmc->errorMessage;
						exit;
					}
			}
			//-- next task row
			$aRow = hsl_xmlmc_rowo($result_id,false);
		}


		//-- delete workflow records from temp db
		$strDelete = "delete from wc_calltasks where sessionid = '".db_pfs($_POST['_table'])."'";
		_execute_xmlmc_sqlquery($strDelete, $tempdb);
	}
	echo "ok";
	close_dbs();

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/workflow/attach_call_workflow.php","END","SERVI");
	}


	exit;
?>