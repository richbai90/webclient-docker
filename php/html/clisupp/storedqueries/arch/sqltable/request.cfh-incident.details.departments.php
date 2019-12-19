<?php

	$intCallref = $_POST['cr'];
	if(!_validate_url_param($intCallref,"num"))
	{
		echo generateCustomErrorString("-100","Invalid callref provided. Please contact your Administrator.");
		exit(0);
	}

	$strSQL  = "SELECT fk_deptcode from cfh_opencalldept where fk_callref = " .  pfs($intCallref);
	$strDB = "swdata";
	$strDepts = "";
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
			$strDept  = get_field($oRS,"fk_deptcode");

			if($strDepts!="")$strDepts .=",";
			$strDepts .= "'" . PrepareForSql($strDept) . "'";
	}

	if($strDepts=="")$strDepts = "''";

	$where = " where value in (".$strDepts.") and list_id='DEPARTMENT' ";
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>