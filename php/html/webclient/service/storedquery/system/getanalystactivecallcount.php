<?php
	//--
	//-- return analysts active call count (used in swchd.actions.js _swchd_assign_call)
	$sqlDatabase = "sw_systemdb";
	$sqlCommand  =  "select count(*) as ct from opencall where status < 16 AND status != 6 and owner  ='" . prepareForSql($_POST['aid']) . "'";


?>