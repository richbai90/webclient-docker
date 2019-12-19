<?php

	//-- global.js relate_calls

	$strSQL = "select callclass from opencall where CALLREF=".$_POST['fcm'];
	$aRS = get_recordset($strSQL, 'sw_systemdb');
	$strCallclass = "";
	if ($aRS->Fetch())
	{
		$strCallclass = get_field($aRS,"callclass");
	}
	//-- app right definitions
	IncludeApplicationPhpFile("call.helpers.php");

	//-- can maange cmdb
	$call = new callFunctions();	
	$call->set_callref($_POST['fcm']);
	if(!$call->can_edit($strCallclass))
	{
		$call->throwError("You are not authorised to modify ". $strCallclass ." records.\nIf you require authorisation please contact your Supportworks Administrator.");
	}
	else
	{

		$sqlDatabase = "swdata";
		$sqlCommand = "INSERT INTO CMN_REL_OPENCALL_OC (FK_CALLREF_M,FK_CALLREF_S,RELCODE) values (![fcm:num],![fcs:num],':[rc]')";
	}
?>