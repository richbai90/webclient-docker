<?php

	//--
	//-- unrelate cis from a call record - used in global.js cmdb.unrelate_ci_from_call function

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
		//-- parse cis
		$parsedCis = "";
		$arrCis = explode(",",$_POST["cids"]);
		while (list($pos,$ciRef) = each($arrCis))
		{
			if($parsedCis!="")$parsedCis.=",";
			$parsedCis .= PrepareForSql($ciRef) ;
		}

		//-- now check if we are doing by relcode if so set appendfilter
		$appendRelFilter = "";
		if(isset($_POST['rel']) && $_POST['rel']!="")$appendRelFilter = " and RELCODE = '" . PrepareForSql($_POST['rel']) . "'";

		$sqlDatabase = "swdata";
		$sqlCommand = "delete from CMN_REL_OPENCALL_CI where FK_CALLREF = ![cr:numeric] and FK_CI_AUTO_ID in (![cids:array])" . $appendRelFilter;
	}
?>