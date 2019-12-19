<?php

	//-- delete link between opencall and right answers - unrelate_call_from_rakb
	
	$strSQL = "select callclass from opencall where CALLREF=".$_POST['cr'];
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
	$call->set_callref($_POST['cr']);
	if(!$call->can_edit($strCallclass))
	{
		$call->throwError("You are not authorised to modify ". $strCallclass ." records.\nIf you require authorisation please contact your Supportworks Administrator.");
	}
	else
	{	
		$SqlDatabase = "swdata";
		$SqlCommand = "DELETE FROM CMN_REL_OPENCALL_RAKB WHERE FK_KBDOC in (![radids:sarray]) and FK_CALLREF = ![cr:num]";
	}

?>