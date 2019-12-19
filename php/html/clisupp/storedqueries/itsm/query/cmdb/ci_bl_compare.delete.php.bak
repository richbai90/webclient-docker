<?php
	//-- used in form ci_bl_compare - oncloseform event (selecting a Baseline and choosing the option Compare)
	
	// - Get PK_AUTO_ID for the record
	$strSQL = "SELECT PK_AUTO_ID FROM CI_BL_COMPARE WHERE CK_CONFIG_ITEM = '![ck_config_item]' AND CK_SESSION_ID = '![ck_session_id]'";
	$oRS = get_recordset($strSQL,'swdata');
	$intIDs = "";
	
	while($oRS->Fetch())
	{
		if($intIDs!="")$intIDs.=",";
		$intIDs.=get_field($oRS,'PK_AUTO_ID');
	}
	
	IncludeApplicationPhpFile("itsm.helpers.php");
	// -- Build an array of columns to set for deleteRecord
	$arrSelectedKeys = explode(',',$intIDs);
	foreach ($arrSelectedKeys as $key)
	{
		$strTable = "CI_BL_COMPARE";
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