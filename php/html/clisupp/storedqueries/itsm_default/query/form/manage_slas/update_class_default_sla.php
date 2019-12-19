<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$intSLAID = $_POST['slaid'];
	$strSLAName = $_POST['slaname'];
	$strCallClass = $_POST['callclass'];
	$strSQL = "select pk_auto_id from itsm_sla_default where callclass='".$strCallClass."'";
	$strSQL .= " and appcode = '".$_core['_sessioninfo']->dataset . "'";
	
	
	$arrData['fk_slad'] = $intSLAID;
	$arrData['fk_slad_name'] = $strSLAName;
	$arrData['appcode'] = $_core['_sessioninfo']->dataset;
	$strTable = "itsm_sla_default";
	
	$aRS = get_recordset($strSQL);
	if ($aRS->Fetch())
	{
		$intPkId = get_field($aRS,"pk_auto_id");
		$arrData['pk_auto_id'] = $intPkId;
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(1==$arc) throwProcessSuccessWithResponse($strSLAName);
		else throwError(100,$arc);
	}
	else
	{
		$arrData['callclass'] = $strCallClass;
		$arc = xmlmc_addRecord($strTable,$arrData);
		if(1==$arc) throwProcessSuccessWithResponse($strSLAName);
		else throwError(100,$arc);
	}


?>