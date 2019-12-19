<?php
	//-- Unrelate KnowledgeBase Document from CI Item(s)

	IncludeApplicationPhpFile("itsm.helpers.php");
	// -- Where statement
	$strWhere = "KB_DOCREF = '![did]' and FK_CI_ID in (![cis:array])";
	// -- Get PK_AUTO_ID from CONFIG_RELKB and delete the record
	$arc = xmlmc_deleteRecord_where("CONFIG_RELKB",$strWhere,"swdata",false);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);
?>