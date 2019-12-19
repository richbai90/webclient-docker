<?php
	$strCIKeys = $_POST['pk_auto_id'];
	$strFilteredKeys = "";
	if($strCIKeys!="-1")
	{
		$strWhere = "";
		//$strSQL = "select SETTING_VALUE from SW_SETTINGS where PK_SETTING = 'SERVICE.CI_BEHAVIOUR.SERVICEREQUEST'";
		$strSQL = "select SETTING_VALUE from SW_SBS_SETTINGS where SETTING_NAME = 'SERVICE.CI_BEHAVIOUR.SERVICEREQUEST' AND APPCODE ='" . $_core['_sessioninfo']->dataset . "'";
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
			$strSetting  = $oRS->GetValueAsString("SETTING_VALUE");
			if($strSetting=="True")
				$strWhere = "displayonservicerequest = 1 AND ";
		}
		$strSQL = "select fk_cmdb_id FROM sc_folio WHERE ".$strWhere." fk_cmdb_id IN (" . PrepareForSql($strCIKeys).")";
		$oRS = new SqlQuery();
		$oRS->Query($strSQL);
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
			$strValue  = $oRS->GetValueAsString("fk_cmdb_id");
			if($strFilteredKeys!="")$strFilteredKeys.=",";
			$strFilteredKeys.= $strValue;
		}
	}
	
	if($strFilteredKeys=="")
		$strFilteredKeys = "-1";

	$parsedFilter.= " where (service_archived IS NULL OR service_archived != 1) AND pk_auto_id in (".$strFilteredKeys.")";

	$boolSubscribed = $_POST['bls'];
	if($boolSubscribed)
		$parsedFilter .= "  and status_portfolio not in ('Pipeline','Retired') and flg_allow_request=1 ";
	else
		$parsedFilter .= "  and status_portfolio not in ('Pipeline','Retired') and flg_allow_subs=1 ";

	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() .$parsedFilter. swfc_orderby();
?>