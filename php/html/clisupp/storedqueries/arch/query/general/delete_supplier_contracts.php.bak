<?php

	//-- global.js delete_contract_pricing - delete contract record by contractid and itemid
	
	// -- Get PK_CONTRACT_ID for the record
	$strSQL = "SELECT PK_CONTRACT_ID FROM CONTRACT WHERE FK_COMPANY_ID = '![fcid]'";
	$oRS = get_recordset($strSQL,'swdata');
	while($oRS->Fetch())
	{
		$intID = get_field($oRS,'PK_CONTRACT_ID');
	}
	// -- Build delete statement for deleteRecord
	$strTable = "CONTRACT";
	$strKeyValue = $intID;	
	$arc = xmlmc_deleteRecord($strTable,$strKeyValue);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);
	
	/*$sqlDatabase = "swdata";
	$sqlCommand = "DELETE FROM CONTRACT WHERE FK_COMPANY_ID = '![fcid]'";*/
?>