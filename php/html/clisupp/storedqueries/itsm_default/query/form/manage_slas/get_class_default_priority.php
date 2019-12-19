<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$strCallClass = $_POST['callclass'];

	$strSQL = "select fk_priority from itsm_sla_default where callclass = '".$strCallClass."'"; 
	$strSQL .= " and appcode = '".$_core['_sessioninfo']->dataset . "'";
	
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$priorityName = get_field($aRS,"fk_priority");
		throwProcessSuccessWithResponse($priorityName);
	}
	else
	{
		throwProcessSuccessWithResponse("");
	}
?>