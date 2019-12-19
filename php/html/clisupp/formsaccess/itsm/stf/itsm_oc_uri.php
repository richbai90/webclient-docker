<?php
	$accessGranted = 1;

	//-- app right definitions
	IncludePhpFile("ITSM/apprights.php");

	$intCallref = 0;
	$strCallclass = "";

	if($_POST['formmode']=='edit'){
		$intKey = $_POST['formkey'];
		$strSelect = "select callclass, callref from OPENCALL join ITSM_OC_URI on ITSM_OC_URI.fk_callref=callref where ITSM_OC_URI.pk_ocuri_id = " . PrepareForSql($intKey);
		$oRS = get_recordset($strSelect);
		if($oRS->Fetch()) {
			$strCallclass = get_field($oRS,'callclass');
			$intCallref = get_field($oRS,'callref');
		}
	} else if($_POST['formmode']=='add') {
		$intCallref = $_POST['fk_callref'];
		$strSelect = "select callclass from OPENCALL where callref = " . PrepareForSql($intCallref);
		$oRS = get_recordset($strSelect);
		if($oRS->Fetch()) {
			$strCallclass = get_field($oRS,'callclass');
		}
	}
	
	if($strCallclass=='Change Request'){
		// if change request, check rfc edit rights
		$call = new callFunctions();	
		$call->set_callref($_POST['fk_callref']);
		if(!$call->can_edit('Change Request'))	{
			$accessGranted = "You are not authorised to modify Change Request records.\nIf you require authorisation please contact your Supportworks Administrator.";
		} else {
			$accessGranted = 1;
		}
	}
?>