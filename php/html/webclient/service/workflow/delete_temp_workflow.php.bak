<?php


	include('../../php/session.php');

	//-- delete worklist or task
	if($_POST['_table']!="" ) 
	{
		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/delete_temp_workflow.php","START","SERVI");
		}

		
		$strDelete = "delete from  wc_calltasks where sessionid = '".$_POST['_table'] ."'";
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
			_wc_debug("service/workflow/delete_temp_workflow.php","END","SERVI");
		}
		exit;
	}


?>