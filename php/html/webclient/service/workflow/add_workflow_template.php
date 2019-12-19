<?php

	//-- add template to lcf temp table 
	include('../../php/session.php');

	if($_POST['_templatename']!="") 
	{

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/workflow/add_workflow_template","START","SERVI");
	}


		$sysdb = connectdb('sw_systemdb',true);
		if(!$sysdb)
		{
			exit;
		}

		//--check if we want to select parentgroup as well
		$strAddWhere="";
		if($_POST['_worklistname']!="") 
		{
			$strAddWhere= " and parentgroup='".db_pfs($_POST['_worklistname'])."' ";
		}

		//-- select template records from system db
		$strSelect = "select * from swtasktemplates where template ='".db_pfs($_POST['_templatename'])."' ".$strAddWhere." order by parentgroupsequence,taskid asc";
		$result_id = _execute_xmlmc_sqlquery($strSelect, $sysdb);
		if(!$result_id)
		{
			exit;
		}

		$tempdb = connectdb('sw_systemdb',true);
		if(!$tempdb)
		{
			exit;
		}

		//-- create recordset and loop through
		$aRow = hsl_xmlmc_rowo($result_id);
		
		//-- either use passed in grp sequence or determine it
		$intCurrentMax = 0;//$_POST['_pgs'];
		if($intCurrentMax==0 || $intCurrentMax=="")
		{
			//-- get current max parent group sequence
			$strCheckMax = "select max(parentgroupsequence) as maxcounter from wc_calltasks where sessionid = '". db_pfs($_POST['_table']) ."'";
			$resid = _execute_xmlmc_sqlquery($strCheckMax, $tempdb);
			if($resid)
			{
				$checkRow = hsl_xmlmc_rowo($resid,false);
				$intCurrentMax= $checkRow->maxcounter;
				$intCurrentMax++;
			}	
		}


		$_ApplyParentGroup = "";
		$_lastGroup="";
		$intUsePGS = 0;
		$intUseTaskID = 0;
		while($aRow)
		{
			if($_lastGroup!=$aRow->parentgroup)
			{
				$_lastGroup = $aRow->parentgroup;
				$_ApplyParentGroup = $aRow->parentgroup;

				//-- check if groupname already exists - if so add * to it
				while(1==1)
				{
					$strCheckTable = "select count(*) as counter from wc_calltasks where sessionid = '". db_pfs($_POST['_table']) ."' and parentgroup = '". db_pfs($_ApplyParentGroup)."' and taskid=0";
					$resid = _execute_xmlmc_sqlquery($strCheckTable, $tempdb);
					if($resid)
					{
						$checkRow = hsl_xmlmc_rowo($resid,false);
						if($checkRow->counter > 0)
						{
							$_ApplyParentGroup = $_ApplyParentGroup . "*";
						}
						else
						{
							break;
						}
					}
					else
					{
						break;
					}
				}
				
				$intUseTaskID = 0;
				$intUsePGS = $aRow->parentgroupsequence + $intCurrentMax;
			}
			

			if($aRow->flags=="")$aRow->flags=0;
			if($aRow->compltbyx=="")$aRow->compltbyx=0;
			if($aRow->notifytime=="")$aRow->notifytime=0;

			//-- create items in list
			$strInsert = "insert into wc_calltasks (";
			
			$strInsert .= "sessionid, ";
			$strInsert .= "taskid, ";
			$strInsert .= "parentgroup, ";
			$strInsert .= "parentgroupsequence, ";
			$strInsert .= "flags, ";
			$strInsert .= "analystid, ";
			$strInsert .= "groupid, ";
			$strInsert .= "details, ";
			$strInsert .= "notifytime, ";
			$strInsert .= "compltbyx, ";
			$strInsert .= "priority, ";
			$strInsert .= "type";
			$strInsert .= ") values (";

			$strInsert .= "'". db_pfs($_POST['_table']) ."',";
			$strInsert .= $intUseTaskID .",";
			$strInsert .= "'". db_pfs($_ApplyParentGroup) ."',";
			$strInsert .= $intUsePGS .",";
			$strInsert .= $aRow->flags .",";
			$strInsert .= "'". db_pfs($aRow->analystid) ."',";
			$strInsert .= "'". db_pfs($aRow->groupid) ."',";
			$strInsert .= "'". db_pfs($aRow->details) ."',";
			$strInsert .= $aRow->notifytime .",";
			$strInsert .= $aRow->compltbyx .",";
			$strInsert .= "'". db_pfs($aRow->priority) ."',";
			$strInsert .= "'". db_pfs($aRow->type) ."'";
			$strInsert .= ")";

			if(!_execute_xmlmc_sqlquery($strInsert, $tempdb))
			{
				echo "fail-insert:";
				echo $strInsert ."\n";
				exit;
			}

			//-- get next
			$aRow = hsl_xmlmc_rowo($result_id);
			$intUseTaskID++;
		}
		echo "ok";

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/add_workflow_template","END","SERVI");
		}

		exit;
	}
?>