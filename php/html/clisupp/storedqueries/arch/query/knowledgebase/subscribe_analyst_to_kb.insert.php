<?php
	//-- Relate ci and kb document - expects ci id (cid) and docref (did)

	IncludeApplicationPhpFile("itsm.helpers.php");
	// -- Build addRecord
	$strTable = "SWKB_SUBSCRIPTION";
	$arrData['SUBSCRIBERID'] = PrepareForSql($session->analyst->AnalystID);
	$arrData['SUBSCRIBERNAME'] = PrepareForSql($session->analyst->Name);
	$arrData['SUBSCRIBERTYPE'] = 'ANALYST';
	$arrData['FK_DOCREF'] = '![doc]';
	$arc = xmlmc_addRecord($strTable,$arrData);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);
	
?>