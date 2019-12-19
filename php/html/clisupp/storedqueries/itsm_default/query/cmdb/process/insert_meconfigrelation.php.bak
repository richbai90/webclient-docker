<?php

	//-- inlcude our cmdb helpers & constants
	//IncludeApplicationPhpFile("itsm.helpers.php");
	//$cmdb = new cmdbFunctions();

	$strSQL = "select PK_AUTO_ID,CK_CONFIG_ITEM,CK_CONFIG_TYPE,DESCRIPTION from CONFIG_ITEMI where PK_AUTO_ID = " . PrepareForSql($_POST['intMeCIKey']);
	$oRS = new SqlQuery();
	$oRS->Query($strSQL);
	//-- Include App Specific Helpers File
    IncludeApplicationPhpFile("app.helpers.php");
	//-- Check for XMLMC Error
	if($oRS->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRS->lastErrorResponse);
		exit(0);
	}
	//-- END
	if($oRS->Fetch())
	{
		$fetchKey  = get_field($oRS,"PK_AUTO_ID");
		$fetchText = get_field($oRS,"CK_CONFIG_ITEM");
		$fetchType = get_field($oRS,"CK_CONFIG_TYPE");
		$fetchDescription = get_field($oRS,"DESCRIPTION");
		
		// -- addRecord
		IncludeApplicationPhpFile("itsm.helpers.php");
		$strTable = "CONFIG_RELI";
		$arrData['FK_PARENT_ID'] = PrepareForSql($fetchKey);
		$arrData['FK_PARENT_TYPE'] = PrepareForSql($fetchType);
		$arrData['FK_PARENT_ITEMTEXT'] = PrepareForSql($fetchText);
		$arrData['FK_CHILD_ID'] = PrepareForSql($_POST['childKey']);
		$arrData['FK_CHILD_TYPE'] = PrepareForSql($_POST['childType']);
		$arrData['FK_CHILD_ITEMTEXT'] = PrepareForSql($_POST['childText']);
		$arrData['FK_DEPENDENCY_TYPE'] = PrepareForSql($_POST['strDependancy']);
		$arrData['FLG_OPERATIONAL'] = PrepareForSql($_POST['ynOperational']);
		$arrData['CHILDDESC'] = PrepareForSql($_POST['strDescription']);
		$arrData['PARENTDESC'] = PrepareForSql($fetchDescription);
		
		$arc = xmlmc_addRecord($strTable,$arrData);
		if(1==$arc) throwSuccess();
		else throwError(100,$arc);
		exit(0);
	}
	else
	{
		throwSuccess(-2); //-- pass affectedRows -2 as this will equate to failure in client when using g.submitsqs - which will return false without showing error msg
	}
?>