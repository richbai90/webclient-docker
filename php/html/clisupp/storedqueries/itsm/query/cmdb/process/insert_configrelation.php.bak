<?php
	//-- given cis will delete it and also delete optionally any baselines
	//-- inlcude our cmdb helpers & constants
	IncludeApplicationPhpFile("cmdb.helpers.php");
	$cmdb = new cmdbFunctions();

	$parentKey= PrepareForSql($_POST['parentKey']);
	$parentType= PrepareForSql($_POST['parentType']);
	$parentText= PrepareForSql($_POST['parentText']);
	$childKey= PrepareForSql($_POST['childKey']);
	$childType= PrepareForSql($_POST['childType']);
	$childText= PrepareForSql($_POST['childText']);
	$strDependancy = PrepareForSql($_POST['strDependancy']);
	$ynOperational= PrepareForSql($_POST['ynOperational']);
	$strParentDesc= PrepareForSql($_POST['strParentDesc']);
	$strChildDesc= PrepareForSql($_POST['strChildDesc']);
	$boolOption= PrepareForSql($_POST['boolOption']);


	$strSQL = "select count(*) as ACOUNTER from CONFIG_RELI where FK_PARENT_ID = " . $parentKey . " AND FK_CHILD_ID = " . $childKey . " AND FK_DEPENDENCY_TYPE = '" . $strDependancy . "'";
	$oRs = new SqlQuery();
	$oRs->Query($strSQL);
	//-- Include App Specific Helpers File
    IncludeApplicationPhpFile("app.helpers.php");
	//-- Check for XMLMC Error
	if($oRs->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRS->lastErrorResponse);
		exit(0);
	}
	//-- END
	if($oRs->Fetch())
	{
		$intCount  = $oRs->GetValueAsNumber("acounter");
		if($intCount>0) 
		{
			throwSuccess($intCount);
		}
	}
	
	// -- Build insert query for addRecord
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strTable = "CONFIG_RELI";
	$arrData['PARENTDESC'] = $strParentDesc;
	$arrData['CHILDDESC'] = $strChildDesc;
	$arrData['FK_PARENT_ID'] = $parentKey;
	$arrData['FK_PARENT_TYPE'] = $parentType;
	$arrData['FK_PARENT_ITEMTEXT'] = $parentText;
	$arrData['FK_CHILD_ID'] = $childKey;
	$arrData['FK_CHILD_TYPE'] = $childType;
	$arrData['FK_CHILD_ITEMTEXT'] = $childText;
	$arrData['FK_DEPENDENCY_TYPE'] = $strDependancy;
	$arrData['FLG_OPERATIONAL'] = $ynOperational;

	$arc = xmlmc_addRecord($strTable,$arrData);
	if(1==$arc) throwSuccess();
	else throwError(100,$arc);
	exit(0);

?>