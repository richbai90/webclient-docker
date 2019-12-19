<?php

	//-- create work list or item in temp able for lcf

	include('../../php/session.php');

	//-- expects uniqueid (formid) to create wc_<uniqueid>_calltasks
	if($_POST['_table']!="") 
	{
		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/create_temp_workitem.php","START","SERVI");
		}

		
		//-- connect to system temp db
		include('../../php/db.helpers.php');

		if(strToLower($_POST['_type'])=="list") 
		{
			//-- create new worklist in temp table
			if(@$_POST['_sequential']=="") $_POST['_sequential'] = 4096;
			$strSQLCreate = "insert into wc_calltasks (sessionid,taskid,parentgroup,parentgroupsequence,flags) values ('".db_pfs($_POST['_table'])."',0,'". db_pfs($_POST['_worklistname'])."',".$_POST['_pgs'].",". $_POST['_sequential'].")";
		}
		else
		{
			//-- create work item in emp table
		}

		$sysdb = connectdb("sw_systemdb");
		if(!$sysdb)
		{
			exit;
		}

		$result_id = _execute_xmlmc_sqlquery($strSQLCreate, $sysdb);
		if(!$result_id)
		{
			close_dbs();
			exit;
		}
		
		echo "ok";

		close_dbs();
		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/create_temp_workitem.php","END","SERVI");
		}


	}

?>