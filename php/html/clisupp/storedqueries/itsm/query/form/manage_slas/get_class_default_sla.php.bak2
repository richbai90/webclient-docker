<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$strCallClass = $_POST['callclass'];

	$strSQL = "select fk_slad_name from itsm_sla_default where callclass = '".$strCallClass."'"; 
	$strSQL .= " and appcode = '".$_core['_sessioninfo']->dataset . "'";
	
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	if ($aRS->Fetch())
	{
		$sladName = get_field($aRS,"fk_slad_name");
		throwProcessSuccessWithResponse($sladName);
	}
	else
	{
		throwProcessSuccessWithResponse("");
	}
?>