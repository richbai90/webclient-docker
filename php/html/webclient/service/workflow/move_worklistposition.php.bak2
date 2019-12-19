<?php

	//-- move worklist up or down

	include('../../php/session.php');

	//-- must have worklistname and dir (up/down) and current seq
	if($_POST['_worklistname']!="" && $_POST['_dir']!="" && $_POST['_pgs']!="") 
	{

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/move_worklistposition.php","START","SERVI");
		}

		
		$iOriginalPos = $_POST['_pgs'];
		$iNewPos = $_POST['_pgs'];
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
		$sysdb = connectdb("sw_systemdb");
		if(!$sysdb)
		{
			exit;
		}

		//-- update group we want to change to -1
		$strUpdateGroup = "update wc_calltasks set parentgroupsequence = 666 where sessionid='".db_pfs($_POST['_table'])."' and parentgroupsequence=" . $iOriginalPos;
		$result_id = _execute_xmlmc_sqlquery($strUpdateGroup, $sysdb);
		if(!$result_id)
		{
			exit;
		}

		//-- now update replacements with current pos
		$strUpdateOtherGroup = "update wc_calltasks set parentgroupsequence = ".$iOriginalPos." where  sessionid='".db_pfs($_POST['_table'])."' and parentgroupsequence=" . $iNewPos;
		$result_id = _execute_xmlmc_sqlquery($strUpdateOtherGroup, $sysdb);
		if(!$result_id)
		{
			exit;
		}

		//-- update orig group (now -1) o new sequence
		$strUpdateGroup = "update wc_calltasks set parentgroupsequence =".$iNewPos." where sessionid='".db_pfs($_POST['_table'])."' and parentgroupsequence=666";
		$result_id = _execute_xmlmc_sqlquery($strUpdateGroup, $sysdb);
		if(!$result_id)
		{
			exit;
		}


		//-- echo ok
		echo "ok";

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/move_worklistposition.php","END","SERVI");
		}

		exit;
	}
?>