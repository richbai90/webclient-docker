<?php
	//--
	//-- return 3rd party contract names (used in swchd.actions.js _swchd_assign_call)
	$sqlDatabase = "sw_systemdb";
	$sqlCommand  =  "select name from system_sla where tpcompany ='" . prepareForSql($_POST['company']) . "'";
?>