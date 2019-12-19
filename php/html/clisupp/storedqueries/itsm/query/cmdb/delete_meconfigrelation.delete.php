<?php
	//-- delete me ci to ci i.e. customer uses ci - used in global.js cmdb.delete_meconfigrelation function
	
	// -- Get PK_AUTO_ID for records
	/*$sqlDatabase = "swdata";
	$sqlCommand = "delete from CONFIG_RELI where FK_PARENT_ID = ![ci:numeric] and FK_CHILD_ID in (![cks:array])";*/
	
	$strSQL = "SELECT PK_AUTO_ID FROM CONFIG_RELI WHERE FK_PARENT_ID = ![ci:numeric] AND FK_CHILD_ID IN (![cks:array])";
	$oRS = get_recordset($strSQL,'swdata');
	$intIDs = "";
	while($oRS->Fetch())
	{
		if($intIDs!="")$intIDs.=",";
		$intIDs.=get_field($oRS,'PK_AUTO_ID');
	}
	if ($intIDs=="")
	{
		throwSuccess();
	}
	// -- Build an array of columns to set for deleteRecord
	IncludeApplicationPhpFile("itsm.helpers.php");
	$arrSelectedKeys = explode(",",$intIDs);
	
		foreach($arrSelectedKeys as $key)
	{
		$strTable = "CONFIG_RELI";
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