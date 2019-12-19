<?php
	IncludeApplicationPhpFile("call.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$intUpID = $_POST['uriid'];

	if(!_validate_url_param($intUpID,"num")) {
		throwProcessErrorWithMsg("Invalid URI id. Please contact your Administrator.");
	}

	$strSQL = "select nindex, fk_callref from itsm_oc_uri where pk_ocuri_id=".$intUpID;
	$aRS = get_recordset($strSQL);
	$nUdindex = 0;
	$intCallref = 0;
	if ($aRS->Fetch())	{
		$intCallref = get_field($aRS,"fk_callref");
		$intSeq = get_field($aRS,"nindex");
		$intSeq++;
	} else {
		throwProcessErrorWithMsg("Unable to load URI. Please contact your Administrator.");
	}

	$call = new callFunctions();	
	$call->set_callref($intCallref);
	if(!$call->can_edit('Change Request'))	{
		throwProcessErrorWithMsg("You are not authorised to modify Change Request records.\nIf you require authorisation please contact your Supportworks Administrator.");
	}
	else
	{
		$strTable = "ITSM_OC_URI";
		$arrData['PK_OCURI_ID'] = $intUpID;
		$arrData['NINDEX'] = $intSeq;
		$arc = xmlmc_updateRecord($strTable,$arrData);
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