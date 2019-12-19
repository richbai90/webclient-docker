<?php

	IncludeApplicationPhpFile("itsm.helpers.php");
	$strCallClass = $_POST['callclass'];
	$strPriorityName = $_POST['priority'];
	$strSQL = "select pk_auto_id from itsm_sla_default where callclass='".$strCallClass."'";
	$strSQL .= " and appcode = '".$_core['_sessioninfo']->dataset . "'";
	
	$aRS = get_recordset($strSQL);
	if ($aRS->Fetch())
	{
		$intPkId = get_field($aRS,"pk_auto_id");
		$strTable = "itsm_sla_default";
		$arrData['pk_auto_id'] = $intPkId;
		$arrData['fk_priority'] = $strPriorityName;
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(1==$arc) throwProcessSuccessWithResponse($strPriorityName);
		else throwError(100,$arc);
	}
	else
	{
		throwProcessErrorWithMsg("Invalid Rule ID supplied. Please contact your Administrator.");
	}


?>