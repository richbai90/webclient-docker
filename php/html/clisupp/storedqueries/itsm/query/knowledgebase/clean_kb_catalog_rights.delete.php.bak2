<?php
	
	IncludeApplicationPhpFile("itsm.helpers.php");
	// -- Build deleteRecord
	$strTable = "SWKB_CATALOG_RIGHTS";
	$strWhere = "CATALOGID = ![catalogid:numeric]";
	$arc = xmlmc_deleteRecord_where($strTable,$strWhere,"swdata",false);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);
?>