<?php

	//-- set worklist to open or sequential

	include('../../php/session.php');


	if($_POST['_worklistname']!="") 
	{

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/set_worklist_sequence.php","START","SERVI");
		}

		if($_POST['_flags']==4096 || $_POST['_flags']=="")
		{
			$iNewFlags=4104;
		}
		else
		{
			$iNewFlags=4096;
		}

		$strUpdate = "update wc_calltasks set flags = ".$iNewFlags." where sessionid='".db_pfs($_POST['_table'])."' and parentgroup='".db_pfs($_POST['_worklistname'])."' and taskid=0";
	
		$sysdb = connectdb('sw_systemdb');
		if(!$sysdb)
		{
			exit;
		}
		//echo $strUpdate;
		$result_id = _execute_xmlmc_sqlquery($strUpdate, $sysdb);
		if(!$result_id)
		{
			close_dbs();
			exit;
		}
		//-- echo back table name so dev knows its ok
		echo "ok";

		close_dbs();
		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/set_worklist_sequence.php","END","SERVI");
		}


		exit;
	}
?>