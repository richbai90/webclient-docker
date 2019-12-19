<?php
	$strAnalyst = PrepareForSql($_POST['analystid']);
	
	//$strInsertSQL = "Insert into CMDB_STAGE_AUDIT (ANALYST,STATUS,CLI_STARTX) VALUES ('".$strAnalyst."','Starting','".time()."')";
	//$oRS = submitsql($strInsertSQL);

	IncludeApplicationPhpFile("itsm.helpers.php");
	// -- Build addrecord
	$strTable = "CMDB_STAGE_AUDIT";
	$arrData['ANALYST'] = $strAnalyst;
	$arrData['STATUS'] = 'Awaiting schedule';
	$arrData['CLI_STARTX'] = time();
	$arc = xmlmc_addRecord($strTable,$arrData);

	$sqlDatabase = "swdata";
	$sqlCommand = "select * from CMDB_STAGE_AUDIT";
?>