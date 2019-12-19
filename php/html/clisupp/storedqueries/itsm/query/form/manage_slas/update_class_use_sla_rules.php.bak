<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$strCallClass = $_POST['callclass'];
	$intUseSLARules = $_POST['use_sla_rules'];
	$strSQL = "select pk_auto_id from itsm_sla_default where callclass='".$strCallClass."'";
	$strSQL .= " and appcode = '".$_core['_sessioninfo']->dataset . "'";
	
	$arrData['flg_use_sla_rules'] = $intUseSLARules;
	$arrData['appcode'] = $_core['_sessioninfo']->dataset;
	$strTable = "itsm_sla_default";
	
	$aRS = get_recordset($strSQL);
	
	if ($aRS->Fetch())
	{
			
		$intPkId = get_field($aRS,"pk_auto_id");
		$arrData['pk_auto_id'] = $intPkId;
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(1==$arc) throwSuccess();
		else throwError(100,$arc);
	}
	else
	{
	$arrData['callclass'] = $strCallClass;
	$arc = xmlmc_addRecord($strTable,$arrData);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);
	}


?>