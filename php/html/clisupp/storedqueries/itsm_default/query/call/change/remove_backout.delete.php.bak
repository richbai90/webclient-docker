<?php
	//-- delete sc_rel record - used in global.js remove_component_custom
	IncludeApplicationPhpFile("call.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	$strSelect = "select fk_callref from ITSM_OC_URI where PK_OCURI_ID = " . PrepareForSql($_POST['key']);
	$oRS = get_recordset($strSelect);
	$strCallref = "";
	if($oRS->Fetch()) {
		$strCallref = get_field($oRS,'fk_callref');
	}

	//-- can maange cmdb
	$call = new callFunctions();	
	$call->set_callref($strCallref);
	if(!$call->can_edit('Change Request'))	{
		$call->throwError("You are not authorised to modify Change Request records.\nIf you require authorisation please contact your Supportworks Administrator.");
	} else {
	
		$strTable = "ITSM_OC_URI";
		$strKeyValue = PrepareForSql($_POST['key']);
		
		$arc = xmlmc_deleteRecord($strTable,$strKeyValue);
		
		if(1==$arc)
		{
			throwSuccess();
		}
		else
		{
			throwError(100,$arc);
		}
	}
?>