<?php
	//-- create ext record instance with just key - used in global.js setup_extended_record
	$intCIKey = $_POST['key'];
	$configTable = swfc_tablename();
	$primaryKey = UC(dd_primarykey($configTable));

	IncludeApplicationPhpFile("itsm.helpers.php");
	
	//-- Build query for addRecord
	$strTable = UC($configTable);
	$arrData[$primaryKey] = $intCIKey;
	$arc = xmlmc_addRecord($strTable,$arrData);
	if(1==$arc)
	{
		throwSuccess();
	}
	else
	{
		throwError(100,$arc);
	}

?>