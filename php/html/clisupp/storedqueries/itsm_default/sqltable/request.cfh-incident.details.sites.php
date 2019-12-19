<?php
	$intCallref = $_POST['cr'];
	if(!_validate_url_param($intCallref,"num"))
	{
		echo generateCustomErrorString("-100","Invalid callref provided. Please contact your Administrator.");
		exit(0);
	}

	$strSQL  = "SELECT fk_site from cfh_opencallsites where fk_callref = " .  pfs($intCallref);
	$strDB = "swdata";
	$strSites = "";
	$oRS  = get_recordset($strSQL,$strDB);
	//-- Check for XMLMC Error
	//-- Include App Specific Helpers File
    IncludeApplicationPhpFile("app.helpers.php");
	if($oRS->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRS->lastErrorResponse);
		exit(0);
	}
	//-- END
	while ($oRS->Fetch())
	{ 
			$strSite  = get_field($oRS,"fk_site");

			if($strSites!="")$strSites .=",";
			$strSites .= "'" . PrepareForSql($strSite) . "'";
	}

	if($strSites=="")$strSites = "''";

	$where = " where site_name in (".$strSites.") ";
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>