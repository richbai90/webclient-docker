<?php	
	//-- unrelate me records from all their cis - used in global.js cmdb.remove_me_ci_link function
	
	// -- Get PK_AUTO_ID for records
	$strSQL = "SELECT PK_AUTO_ID FROM CONFIG_RELME WHERE FK_ME_KEY IN (![mes:sarray])";
	$aRS = get_recordset($strSQL, 'swdata');
	$intIDs = "";
	while ($aRS->Fetch())
	{
		if($intIDs!="")$intIDs.=",";
		$intIDs.=get_field($aRS,'PK_AUTO_ID');
	}
	
	// -- Build an array of columns to set for deleteRecord	
	IncludeApplicationPhpFile("itsm.helpers.php");

	$arrSelectedKeys = explode(',',$intIDs);
	foreach ($arrSelectedKeys as $key)
	{
		$strTable = "CONFIG_RELME";
		$strKeyValue = $key;
		
		$arc = xmlmc_deleteRecord($strTable,$strKeyValue);
		if(1==$arc)
		{
			continue;
		}
		else
		{
			throwError(100,$arc);
		}
	}
	throwSuccess();

?>