<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)
	$boolPaged = $_POST['paged'];
	$intPageNo = $_POST['start'];
	$webclient = $_POST['webclient']; //-- Is Called By Webclient
	
	if(!isset($_POST['paged']) ||$_POST['start']=="")
	{
		throwSuccess();
	}
	//-- Include Paging Specific Helpers File
	IncludeApplicationPhpFile("paging.helpers.php");
	
	//-- loop passed in columns for specific table - check valid sqlobjectnames and create filter
	$strFilter = createTableFilterFromParams(swfc_tablename());
	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}

	$strOrgValue = $_POST['multi_org'];
	$strSiteValue = $_POST['multi_site'];
	
	$boolSearchMultiOrganisation = false;
	//$strSQL = "select SETTING_VALUE from SW_SETTINGS where PK_SETTING = 'SEARCH.CUSTOMERS.MULTI_ORGANISATION'";
	$strSQL = "SELECT SETTING_VALUE FROM SW_SBS_SETTINGS WHERE SETTING_NAME = 'SEARCH.CUSTOMERS.MULTI_ORGANISATION' AND APPCODE ='" . $_core['_sessioninfo']->dataset . "'";

	$oRS = new SqlQuery();
	$oRS->Query($strSQL);
	if($oRS->Fetch())
	{
		$boolSearchMultiOrganisation = $oRS->GetValueAsString("SETTING_VALUE")=="'true'";
	}
	
	$boolSearchMultiSite = false;
	//$strSQL = "select SETTING_VALUE from SW_SETTINGS where PK_SETTING = 'SEARCH.CUSTOMERS.MULTI_SITE'";
	$strSQL = "SELECT SETTING_VALUE FROM SW_SBS_SETTINGS WHERE SETTING_NAME = 'SEARCH.CUSTOMERS.MULTI_SITE' AND APPCODE ='" . $_core['_sessioninfo']->dataset . "'";
	$oRS = new SqlQuery();
	$oRS->Query($strSQL);
	if($oRS->Fetch())
	{
		$boolSearchMultiSite = $oRS->GetValueAsString("SETTING_VALUE")=="'true'";
	}

	if (""!= $strFilter && ( (""!=$strOrgValue && $boolSearchMultiOrganisation) || (""!=$strSiteValue && $boolSearchMultiSite) ) )
	{
		$boolMultiComp = (""!=$strOrgValue && $boolSearchMultiOrganisation);
		$boolMultiSite = (""!=$strSiteValue && $boolSearchMultiSite);
		
		$strSelect = "select keysearch from USERDB ";
		if ($boolMultiComp) $strSelect .= " join USERDB_COMPANY on USERDB.KEYSEARCH = USERDB_COMPANY.FK_USER_ID ";
		if ($boolMultiSite) $strSelect .= " join CONFIG_RELI on USERDB.KEYSEARCH = CONFIG_RELI.FK_CHILD_ITEMTEXT where CONFIG_RELI.FK_PARENT_TYPE='ME->SITE' AND CONFIG_RELI.FK_CHILD_TYPE='ME->CUSTOMER' AND ";
		if (!$boolMultiSite) $strSelect .= " where ";
		
		$strSelect .= " ( " . $strFilter . " ) ";
		if ($boolMultiComp) $strSelect = str_replace(" FK_COMPANY_ID ", " FK_ORG_ID ", $strSelect);
		if ($boolMultiSite) $strSelect = str_replace(" SITE ", " FK_PARENT_ITEMTEXT ", $strSelect);
		
		$oRS = get_recordset($strSelect);
		$keys = " KEYSEARCH IN (''";
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
			$strValue = get_field($oRS,"keysearch");
			$keys .=",";
			$keys .= "'" . PrepareForSql($strValue) . "'";
		}
		$keys .=")";
		$strFilter =  $keys;
	} 
	
	//-- Pass Filter to Paging Functions
	$strPagedQuery = sql_page($strFilter, $intPageNo, swfc_selectcolumns(), swfc_fromtable(), swfc_orderby());
	
	//-- if we have a filter then and the where
	if($strFilter!="") $strFilter = " where " . $strFilter;

	$sqlDatabase = "swdata";
	
	if($strPagedQuery)
	{
		$sqlCommand = $strPagedQuery;
	}else
	{
		$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $strFilter . swfc_orderby();
	}
	
?>