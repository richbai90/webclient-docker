<?php

	//-- global.js unrelate_slave_calls
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
		$strCode = pfs($_POST['rc']);

		$sqlDatabase = "swdata";
		$sqlCommand = "DELETE FROM CMN_REL_OPENCALL_OC where FK_CALLREF_M = ![fcm] and FK_CALLREF_S  in (![fcs:array])";
		if($strCode!= "") 	$sqlCommand .= " and RELCODE = '" . $strCode . "'";
	}

?>