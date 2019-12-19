<?php
	//-- 2012.11.07
	//-- return data from swdata.swlist with passed in list id to be used within filter filter

	$strCompanies = "";

	if(!isset($_POST["pk_company_id"]))
	{
		throwSuccess(-2);
	}

	else{
		$strCompanies = "'".PrepareForSql($_POST["pk_company_id"])."'";
		$strSQL = "select FK_ORG_ID from USERDB_COMPANY where FK_USER_ID = '" . PrepareForSql($_POST['fk_user_id'])."'";	
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
		while($oRS->Fetch())
		{
			$strComp  = $oRS->GetValueAsString("FK_ORG_ID");//g.get_field($oRS,"FK_ORG_ID");
			if($strCompanies!="")
				$strCompanies .=",";
			$strCompanies .="'".PrepareForSql($strComp)."'";
		}


		$colName = "PK_COMPANY_ID";
		//-- oracle mods
		if($session->oracleInUse)
		{
			$colName = " UPPER(" . $colName . ") ";
			$strCompanies = " UPPER(" . $strCompanies . ") ";

		}

		$parsedFilter  = " where " . $colName . " IN (". $strCompanies . ")";

		$sqlDatabase = "swdata";
		$sqlCommand = swfc_selectcolumns() . " from company ".$parsedFilter. swfc_orderby();
	}
?>