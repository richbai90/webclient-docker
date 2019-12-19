<?php
	//-- Unrelate parent doc from ci types
	
	IncludeApplicationPhpFile("itsm.helpers.php");
	// -- Build deleteRecord
	$strWhere = "KB_DOCREF = '![did]' and FK_CONFIG_TYPE in (![cts:sarray])";
	$strTable = "CI_TYPE_RELKB";
	$arc = xmlmc_deleteRecord_where($strTable,$strWhere,"swdata",false);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);
?>