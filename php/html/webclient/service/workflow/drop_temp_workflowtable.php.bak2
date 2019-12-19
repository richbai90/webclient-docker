<?php

	//-- create a temp table in tempdb to store call form worklist and work items
	//-- once call is logged or saved (cdf) can use temp info to create iems using php api
	//-- then drop temp table

	include('../../php/session.php');

	//-- delete worklist or task
	if($_POST['_uniqueid']!="" ) 
	{
		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/drop_temp_workflowtable.php","START","SERVI");
		}

		
		$strDelete = "delete from  wc_calltasks where sessionid = '".$_POST['_uniqueid'] ."'";
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
			_wc_debug("service/workflow/drop_temp_workflowtable.php","END","SERVI");
		}
		exit;
	}
	
?>