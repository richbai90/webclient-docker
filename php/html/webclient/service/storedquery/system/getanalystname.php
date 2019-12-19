<?php
	//--
	//-- return analyst name (used in swchd.actions.js _swchd_assign_call)
	$sqlDatabase = "sw_systemdb";
	$sqlCommand  =  "select name from swanalysts where analystid ='" . prepareForSql($_POST['aid']) . "'";
?>