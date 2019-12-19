<?php

	//--
	//-- unrelate parent docs from calls dids = comma sep docrefs (str) ocids = comma sep callrefs (num)
	//-- app right definitions
	IncludeApplicationPhpFile("call.helpers.php");

	$strSQL = "select distinct(callclass) as callclass from opencall where CALLREF in (".$_POST['ocids'].")";
	$aRS = get_recordset($strSQL, 'swdata');
	$strCallclass = "";
	$boolError = false;
	$call = new callFunctions();	
	while($aRS->Fetch() && !$boolError)
	{
		$strCallclass = get_field($aRS,"callclass");
		//if(!$call->can_edit($strCallclass))
			$boolError = true;
	}
	IncludeApplicationPhpFile("app.helpers.php");
	//-- Check for XMLMC Error
	if($aRS->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRS->lastErrorResponse);
		exit(0);
	}
	//-- can maange cmdb
	if(!$boolError)
	{
		$call->throwError("You are not authorised to modify ". $strCallclass ." records.\nIf you require authorisation please contact your Supportworks Administrator.");
	}
	else
	{	
		$sqlDatabase = "swdata";
		$sqlCommand = "delete from CMN_REL_OPENCALL_KB where FK_KBDOC in (![dids:sarray]) and FK_CALLREF in (![ocids:array])";
	}

?>