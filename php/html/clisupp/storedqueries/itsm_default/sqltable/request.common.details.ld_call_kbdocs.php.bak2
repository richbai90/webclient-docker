<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)
	if(!isset($_POST['cr']))
	{
			//echo generateCustomErrorString("-100","An invalid Callref was specified. Please contact your Administrator.");
			//exit(0);
			//--F0108357
			throwSuccess();
	}

	$strDocs = "";
	if($_POST['cr']!="")
	{
		$strSelectDocs = "select fk_kbdoc from cmn_rel_opencall_kb where fk_callref = ".$_POST['cr'];
		$oRS = get_recordset($strSelectDocs,"swdata");
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
			if ($strDocs!="")$strDocs .=",";
			$strDocs .= "'".PrepareForSql(get_field($oRS,"fk_kbdoc"))."'";
		}
	}
	$where = "";
	if($strDocs=="")
		$strDocs = "''";
	$where = "where docref in (".$strDocs.") ";

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>