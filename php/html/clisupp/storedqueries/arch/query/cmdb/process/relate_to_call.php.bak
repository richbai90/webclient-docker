<?php

	//-- relate a ci from a call record - global.js cmdb_relate_to_call

	
	$sqlDatabase = "swdata";
	if(isset($_POST['rc'])) //-- do we want to store relcode
	{
		$sqlCommand = "INSERT INTO CMN_REL_OPENCALL_CI (FK_CALLREF,FK_CI_AUTO_ID,RELCODE) values (![cr],![cid],':[rc]')";
	}
	else
	{
		$sqlCommand = "INSERT INTO CMN_REL_OPENCALL_CI (FK_CALLREF,FK_CI_AUTO_ID) values (![cr:numeric],![cid:numeric])";
	}
?>