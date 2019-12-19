<?php
	//-- Delete doc by subscribetr id - expects  docref (doc)

	IncludeApplicationPhpFile("itsm.helpers.php");
	// -- Build deleteRecord
	$strTable = "SWKB_SUBSCRIPTION";
	$strWhere = "SUBSCRIBERID = '". PrepareForSql($session->analyst->AnalystID) ."' AND SUBSCRIBERTYPE = 'ANALYST' AND FK_DOCREF = '![doc]'";
	$arc = xmlmc_deleteRecord_where($strTable,$strWhere,"swdata",false);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);
	
?>