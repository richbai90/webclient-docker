<?php	
	// -- PM00125532 - Delete SelfService Wizard - Records in 5 tables
	IncludeApplicationPhpFile("itsm.helpers.php");
			
	$strKeyValue = $_POST["swn"];
	$boolContinue = false;
	
	// -- Delete from WSSM_WIZ
	$arc = xmlmc_deleteRecord("WSSM_WIZ",$strKeyValue);
	if(1==$arc)
		$boolContinue = true;
	
	if($boolContinue)
	{
		$strWizStageSQL = "SELECT PK_AUTO_ID FROM WSSM_WIZ_STAGE WHERE FK_WIZ = '".PrepareForSql($strKeyValue)."'";
		$oRS = get_recordset($strWizStageSQL,'swdata');
		$arrIDs = "";
		while($oRS->Fetch())
			$arrIDs[] = get_field($oRS,'PK_AUTO_ID');
		
		// -- Loop through each Step/Stage and delete related record in WSSM_WIZ_Q, WSSM_WIZ_QC and WSSM_WIZ_QAC
		foreach($arrIDs as $intID)
		{
			$strSQL = "SELECT PK_QID FROM WSSM_WIZ_Q WHERE FK_WIZ_STAGE = ".$intID;
			$oRS = get_recordset($strSQL,'swdata');
			$arrPkQid = "";			
			while($oRS->Fetch())
				$arrPkQid[] = get_field($oRS,'PK_QID');
			
			foreach($arrPkQid as $intPkQid)
			{
				xmlmc_deleteRecord("WSSM_WIZ_Q",$intPkQid);
				xmlmc_deleteRecord_where("WSSM_WIZ_QC","FK_QID = ".$intPkQid,"swdata",true);
				xmlmc_deleteRecord_where("WSSM_WIZ_QAC","FK_QID = ".$intPkQid,"swdata",true);
			}
		}
		
		// -- Delete from WSSM_WIZ_STAGE
		$strWhere = "FK_WIZ = '".PrepareForSql($strKeyValue)."'";
		$arc = xmlmc_deleteRecord_where("WSSM_WIZ_STAGE",$strWhere);
		if(1!=$arc)
			$boolContinue = false;
	}
		
	if(!$boolContinue)
		throwError(100,"Unable to delete SelfService Wizard.");
	
?>