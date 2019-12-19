<?php

	//-- copy table record
	//-- pk must be auto id
	//-- pass in optional column name to hardcode value
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	$strTable = swfc_tablename();
	$copyFromColumn = PrepareForSql($_POST['fkc']);
	$copyFromKeyValue = PrepareForSql($_POST['fkv']);
	$copyToKeyValue = PrepareForSql($_POST['ctkv']);

	//-- select record to copy
	if(!copyRecordXMLMC($strTable, $copyFromColumn,$copyFromKeyValue,$copyToKeyValue))
	{
		throwError(-200,"Failed to copy record on [".$strTable."]. Please contact your administrator."); //-- fail and exit
	}
	else
	{
		throwSuccess(1); //-- success and exit - affectedrow = 1
	}
?>