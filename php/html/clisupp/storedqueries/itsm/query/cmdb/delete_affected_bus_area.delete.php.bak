<?php
	//-- remove the association between the Affected Business Area and the CI - global.js cmdb_delete_affected_bus_area
	
	// -- Get PK_ID for the record
	$strSQL = "SELECT PK_ID FROM CONFIG_BUS_AREA WHERE FK_CONFIG_ITEM = '![fci]' AND FK_BUS_AREA_ID = '![fbaid]'";
	$oRS = get_recordset($strSQL,'swdata');
	$intID = "";
	while($oRS->Fetch())
	{
		$intID = get_field($oRS,'PK_ID');
	}
	
	// -- Build an array of columns to set for deleteRecord
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strTable = "CONFIG_BUS_AREA";
	$strKeyValue = $intID;
	$arc = xmlmc_deleteRecord($strTable,$strKeyValue);
	if(1==$arc)
	{
		throwSuccess();
	}
	else
	{
		throwError(100,$arc);
	}

?>