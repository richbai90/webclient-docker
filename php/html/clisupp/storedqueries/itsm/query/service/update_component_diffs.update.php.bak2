<?php

	//-- used in global.js update_service_costs
	IncludeApplicationPhpFile("itsm.helpers.php");

	$strTable = "SC_RELS";
	$arrData['PK_AUTO_ID'] = '![id:numeric]';
	$arrData['CUSTOMISE_DIFF'] = ':[cd]';
	$arrData['PRICE_DIFF'] = ':[pd]';
	$arc = xmlmc_updateRecord($strTable,$arrData);
	if(1==$arc)
	{
		throwSuccess();
	}else
	{
		throwError(100,$arc);
	}
?>