<?php
	//-- move CONFIG_RELME from one ci to another - used in global.js copy_merelations
	
	IncludeApplicationPhpFile("itsm.helpers.php");
	// -- Get PK_AUTO_ID for record
	$strSQL = "SELECT PK_AUTO_ID FROM CONFIG_RELME WHERE FK_CI_ID = ![intCopyFromCIKey:numeric]";
	$oRS = get_recordset($strSQL,'swdata');
	$intID = "";
	while ($oRS->Fetch())
	{
		if($intID!="")$intID.=",";
		$intID.= get_field($oRS,'PK_AUTO_ID'); 
	}
	
	// -- Build an array of columns to set for updateRecord
	$arrSelectedKeys = explode(',',$intID);
	foreach($arrSelectedKeys as $key)
	{
		$strTable = "CONFIG_RELME";
		$arrData['PK_AUTO_ID'] = $key;
		$arrData['FK_CI_ID'] = '![intCopyToCIkey:numeric]';
		
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if (1==$arc)
		{
			continue;
			//throwSuccess();
		}
		else
		{
			throwError(100,$arc);
		}
	}
	throwSuccess();
	
?>