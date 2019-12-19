<?php
	//--
	//-- relate a ci to a callrecord - used in global.js cmdb.relate_ci_to_call function
	$strSQL = "select callclass from opencall where CALLREF=".$_POST['cr'];
	$aRS = get_recordset($strSQL, 'sw_systemdb');
	$strCallclass = "";
	if ($aRS->Fetch())
	{
		$strCallclass = get_field($aRS,"callclass");
	}
	//-- app right definitions
	IncludeApplicationPhpFile("call.helpers.php");
	$call = new callFunctions();
	$call->set_callref($_POST['cr']);
	//-- can maange cmdb
	if(!$call->can_edit($strCallclass, false))
	{
		$call->throwError("You are not authorised to modify ". $strCallclass ." records.\nIf you require authorisation please contact your Supportworks Administrator.");
	}
	else
	{

		$sqlDatabase = "swdata";
		$sqlCommand =  "insert into CMN_REL_OPENCALL_CI (FK_CALLREF,FK_CI_AUTO_ID,RELCODE)  values (![cr:numeric],![cid:numeric],':[rel]')";
	}
?>