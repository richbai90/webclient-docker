<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strTable = $_POST['tbl'];
	$intCallref = $_POST['cr'];
	if(!get_record($strTable, $intCallref))
	{
		$strPriKeyCol = getTablePrimaryKeyName($strTable);
		
		$arrData[$strPriKeyCol] = $intCallref;
		$arc = xmlmc_addRecord($strTable,$arrData);
		if(1==$arc)
		{
			throwSuccess();
		}
		else
		{
			throwError(100,$arc);
		}
	}
	throwSuccess(1);
	exit;
?>