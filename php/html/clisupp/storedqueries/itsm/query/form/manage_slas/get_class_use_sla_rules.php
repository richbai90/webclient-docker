<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$strCallClass = $_POST['callclass'];

	$strSQL = "select flg_use_sla_rules from itsm_sla_default where callclass = '".$strCallClass."'"; 
	$strSQL .= " and appcode = '".$_core['_sessioninfo']->dataset . "'";
	
	$aRS = get_recordset($strSQL);
	
	//echo $strSQL;
	//trowSuccess();
	
	if ($aRS->Fetch())
	{
		$intUseSLARules = get_field($aRS,"flg_use_sla_rules");
		throwProcessSuccessWithResponse($intUseSLARules);
	}
	else
	{
		throwProcessSuccessWithResponse("");
	}
?>