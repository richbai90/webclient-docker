<?php
	//-- used in global.js cmdb_view_affected_bus_area

	// -- Get PK_ID for record
	$strSQL = "SELECT PK_ID FROM CONFIG_BUS_AREA WHERE FK_BUS_AREA_ID = '![fbaid]'";
	$oRS = get_recordset($strSQL,'swdata');
	while ($oRS->Fetch())
	{
		$intID = get_field($oRS,"PK_ID");
	}
	
	// -- Build an array of columns to set for updateRecord
	$strTable = "CONFIG_BUS_AREA";
	$arrData['PK_ID'] = $intID;	
	$arrData['KNOWN_AS'] = ':[ka]';
	$arrData['PRINCIPLE_CONTACT'] = ':[pc]';
	$arrData['PRINCIPLE_CONTACT_ID'] = ':[pcid]';
	$arrData['GROUP_EMAIL_ADDRESS'] = ':[gea]';
	
	IncludeApplicationPhpFile("itsm.helpers.php");
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