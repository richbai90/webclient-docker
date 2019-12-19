<?php

	//-- global.js add_contract_pricing - add contract for item if does not already exist
	
	if(get_rowcount("contract_pricing","FK_CONTRACT_ID = '![fcid]' and FK_ITEM_ID = ![fid:numeric]")<1)
	{
		IncludeApplicationPhpFile("itsm.helpers.php");
		// -- Build an array of columns to set for addRecord
		$strTable = "CONTRACT_PRICING";
		$arrData['FK_CONTRACT_ID'] = '![fcid]';
		$arrData['FK_ITEM_ID'] = '![fid:numeric]';
		$arrData['FK_ITEM_NAME'] = ':[fin]';
		$arrData['FK_ITEM_TYPE'] = ':[fit]';
		$arrData['STDPRICE'] = ':[sp]';
		$arc = xmlmc_addRecord($strTable,$arrData);
		if(1==$arc) throwSuccess();
		else throwError(100,$arc);
	}
	else
	{
		throwSuccess(0);
	}

?>