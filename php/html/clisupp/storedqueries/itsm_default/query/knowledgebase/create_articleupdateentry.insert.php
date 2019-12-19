<?php
	//-- insert swkb change record for a given document

	IncludeApplicationPhpFile("itsm.helpers.php");
	// -- Build addRecord
	$strTable = "SWKB_CHANGES";
	$arrData['DOCREF'] = '![did]';
	$arrData['CHANGEDESC'] = ':[desc]';
	$arrData['CHANGEDATEX'] = GetCurrentEpocTime();
	$arrData['CHANGEBYANALYSTID'] = PrepareForSql($session->analystId);
	$arc = xmlmc_addRecord($strTable,$arrData);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);
  
?>