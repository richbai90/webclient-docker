<?php

	//-- global.js cmdb get_ci_mes
	$callref = $_POST['fk_callref'];
	$relcode = $_POST['relcode'];

	
	
	
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT FK_CI_AUTO_ID FROM CMN_REL_OPENCALL_CI WHERE FK_CALLREF = '".PrepareForSql($callref)."' AND RELCODE ='".PrepareForSql($relcode)."'";


?>