<?php

	//-- move item up or down

	include('../../php/session.php');

	//-- must have worklistname and dir (up/down) and current seq
	if($_POST['_worklistname']!="" && $_POST['_taskid'] && $_POST['_dir']!="") 
	{

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/move_workitemposition.php","START","SERVI");
		}

		$iOriginalPos = $_POST['_taskid'];
		$iNewPos = $_POST['_taskid'];

		if($_POST['_dir']=="up")
		{
			$iNewPos--;
		}
		else
		{
			$iNewPos++;
		}
		
		//-- trying to move up
		if($iNewPos<0)exit;

		//-- connect db
		$sysdb = connectdb("sw_systemdb",true);
		if(!$sysdb)
		{
			exit;
		}

		//-- update task we want to change to -1
		$strUpdateTask = "update wc_calltasks set taskid = 666 where sessionid='".db_pfs($_POST['_table'])."' and parentgroup='" . db_pfs($_POST['_worklistname'])."' and taskid = ".$iOriginalPos;
		$result_id = @_execute_xmlmc_sqlquery($strUpdateTask, $sysdb);
		if(!$result_id)
		{
			exit;
		}

		//-- now update replacements with current pos
		$strUpdateOtherTask = "update wc_calltasks set taskid = ".$iOriginalPos." where sessionid='".db_pfs($_POST['_table'])."' and parentgroup='" . db_pfs($_POST['_worklistname'])."' and taskid = ".$iNewPos;
		$result_id = @_execute_xmlmc_sqlquery($strUpdateOtherTask, $sysdb);
		if(!$result_id)
		{
			exit;
		}

		//-- update orig group (now -1) o new sequence
		$strUpdateTask = "update wc_calltasks set taskid = ".$iNewPos." where sessionid='".db_pfs($_POST['_table'])."' and parentgroup='" . db_pfs($_POST['_worklistname'])."' and taskid = 666";
		//echo $strUpdateTask;
		$result_id = @_execute_xmlmc_sqlquery($strUpdateTask, $sysdb);
		if(!$result_id)
		{
			exit;
		}


		//-- echo ok
		echo "ok";

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/move_workitemposition.php","END","SERVI");
		}


		exit;
	}
?>