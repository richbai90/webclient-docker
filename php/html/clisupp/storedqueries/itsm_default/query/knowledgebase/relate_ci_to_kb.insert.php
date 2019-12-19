<?php
	//-- Relate CI and KnowledgeBase Documents - Expects ci id (cid) and docref (did)
	
	IncludeApplicationPhpFile("itsm.helpers.php");
	// -- Build addRecord
	$strTable = "CONFIG_RELKB";
	$arrData['FK_CI_ID'] = '![cid:numeric]';
	$arrData['KB_DOCREF'] = '![did]';
	$arc = xmlmc_addRecord($strTable,$arrData);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);
?>