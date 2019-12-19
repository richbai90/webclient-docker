<?php


	include('../../php/session.php');

	//-- delete worklist or task
	if($_POST['_worklistname']!="" ) 
	{

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/delete_temp_workitem.php","START","SERVI");
		}

		$strTaskWhere="";
		if($_POST['_taskid']!="" ) $strTaskWhere="and taskid = " . $_POST['_taskid'];
		$strDelete = "delete from  wc_calltasks where sessionid='".$_POST['_table']."' and parentgroup = '".db_pfs($_POST['_worklistname'])."' ". $strTaskWhere;

		$sysdb = connectdb("sw_systemdb");
		if(!$sysdb)
		{
			exit;
		}

		$result_id = _execute_xmlmc_sqlquery($strDelete, $sysdb);
		if(!$result_id)
		{
			exit;
		}
		//-- echo back table name so dev knows its ok
		echo "ok";

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/delete_temp_workitem.php","END","SERVI");
		}


		exit;
	}


?>