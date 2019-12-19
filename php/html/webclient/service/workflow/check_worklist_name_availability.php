<?php

	include('../../php/session.php');

	//-- given table name and worklist name check if the name is available
	$strUseName = $_POST['_worklistname'];
	if($_POST['_worklistname']!="" && $_POST['_callref']!="")
	{

		//-- log activity
		if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
		{
			_wc_debug("service/workflow/check_worklist_name_availability.php","START","SERVI");
		}

		//-- connect to temp db
		$tempdb = connectdb('sw_systemdb',true);
		if(!$tempdb)
		{
			echo "Could not access temporary database."; 
			exit;
		}

		while (1==1)
		{
			$strCheckTable = "select count(*) as counter from calltasks where parentgroup = '". db_pfs($strUseName)."' and callref=" . $_POST['_callref'];
			$resid = _execute_xmlmc_sqlquery($strCheckTable, $tempdb);
			if($resid)
			{
				$checkRow = hsl_xmlmc_rowo($resid);
				if($checkRow->counter > 0)
				{
					//-- name exists
					$strUseName .= "*";
				}
				else
				{
					break;
				}
			}
		}
	}
	echo $strUseName;

	close_dbs();

	//-- log activity
	if(defined("_LOG_WC_SERVICE_ACTIVITY") && _LOG_WC_SERVICE_ACTIVITY)
	{
		_wc_debug("service/workflow/check_worklist_name_availability.php","END","SERVI");
	}

	

	exit;
?>