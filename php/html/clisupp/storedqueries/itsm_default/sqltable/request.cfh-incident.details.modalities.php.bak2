<?php
	$intCallref = $_POST['cr'];
	if(!_validate_url_param($intCallref,"num"))
	{
		echo generateCustomErrorString("-100","Invalid callref provided. Please contact your Administrator.");
		exit(0);
	}

	$strSQL  = "SELECT fk_modcode from cfh_opencallmodality where fk_callref = " .  pfs($intCallref);
	$strDB = "swdata";
	$strMods = "";
	$oRS  = get_recordset($strSQL,$strDB);
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
	while ($oRS->Fetch())
	{ 
			$strMod  = get_field($oRS,"fk_modcode");

			if($strMods!="")$strMods .=",";
			$strMods .= "'" . PrepareForSql($strMod) . "'";
	}

	if($strMods=="")$strMods = "''";

	$where = " where value in (".$strMods.") and list_id='MODALITY' ";
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>