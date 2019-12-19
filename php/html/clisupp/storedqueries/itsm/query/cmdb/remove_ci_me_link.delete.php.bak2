<?php
	//-- unrelate cis from mes - global.js cmdb.remove_ci_me_link
	//-- parse mes - optional;
	$appendFilter= "";
	if(isset($_POST["mes"]) && $_POST["mes"]!="")
	{
		$appendFilter= " and FK_ME_KEY in (![mes:sarray])";
	}
	
	// -- Get PK_AUTO_ID for records
	$strSQL = "SELECT PK_AUTO_ID FROM CONFIG_RELME WHERE FK_CI_ID IN (![cids:array])".$appendFilter;
	$aRS = get_recordset($strSQL, 'swdata');
	$intIDs = "";
	while ($aRS->Fetch())
	{
		if($intIDs!="")$intIDs.=",";
		$intIDs.=get_field($aRS,'PK_AUTO_ID');
	}
	if ($intIDs=="")
	{
		throwSuccess();
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