<?php

	//-- global.js delete_contract_pricing - delete contract record by contractid and itemid
	
	// == Get PK_ID for the record
	$strSQL = "SELECT PK_ID FROM CONTRACT_PRICING WHERE FK_CONTRACT_ID = '![fcid]' AND FK_ITEM_ID = ![fid:numeric]";
	$oRS = get_recordset($strSQL,'swdata');
	
	while($oRS->Fetch())
	{
		$intID = get_field($oRS,'PK_ID');
	}
	
	// -- Build a delete statement for deleteRecord
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strTable = "CONTRACT_PRICING";
	$strKeyValue = $intID;
	$arc = xmlmc_deleteRecord($strTable,$strKeyValue);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);

	?>