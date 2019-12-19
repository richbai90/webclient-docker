<?php
	//-- de-activate ci baseline
	
	// -- Build an array of columns to set for deleteRecord
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strTable = "CONFIG_ITEMI";
	$arrData['PK_AUTO_ID'] = '![intCIkey:numeric]';
	$arrData['ISACTIVEBASELINE'] = 'No';
	
	$arc = xmlmc_updateRecord($strTable,$arrData);
	if(1==$arc)
	{
		throwSuccess();
	}
	else
	{
		throwError(100,$arc);
	}

?>