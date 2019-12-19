<?php

	//-- create a temp table in tempdb to store call form worklist and work items
	//-- once call is logged or saved (cdf) can use temp info to create iems using php api
	//-- then drop temp table

	include('../../php/session.php');

	//-- expects uniqueid (formid) to create wc_<uniqueid>_calltasks
	if($_POST['_worklistname']!="" && $_POST['_newname']!="") 
	{

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/rename_worklist","START","SERVI");
		}

		$strUpdate = "update wc_calltasks set parentgroup = '".db_pfs($_POST['_newname'])."' where sessionid='".db_pfs($_POST['_table'])."' and parentgroup='".db_pfs($_POST['_worklistname'])."'";

		
		$sysdb = connectdb("sw_systemdb");
		if(!$sysdb)
		{
			exit;
		}

		$result_id = _execute_xmlmc_sqlquery($strUpdate, $sysdb);
		if(!$result_id)
		{
			exit;
		}
		//-- echo back table name so dev knows its ok
		echo "ok";

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/rename_worklist","END","SERVI");
		}

		exit;
	}
?>