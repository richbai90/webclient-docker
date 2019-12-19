<?php
	
	$strSQL = "SELECT PK_AUTO_ID FROM CONFIG_RELI WHERE FK_CHILD_ID = ![ciid:numeric] AND FK_PARENT_ITEMTEXT = ![slaid:numeric]";
	$oRS = get_recordset($strSQL,'swdata');
	$intID = "";
	while($oRS->Fetch())
	{
		$intID = get_field($oRS,'PK_AUTO_ID');
	}
	if ($intID == "")
	{
		throwSuccess();
	}
	// -- Build an array of columns to set for deleteRecord
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strTable = "CONFIG_RELI";	
	$arc = xmlmc_deleteRecord($strTable,$intID);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);	

?>