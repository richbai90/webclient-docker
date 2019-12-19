<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)
	if(!isset($_POST['cr']))
	{
		//--F0108357
		//echo generateCustomErrorString("-100","An invalid Callref was specified. Please contact your Administrator.");
		//exit(0);
		throwSuccess();
	}

	$intCallrefM = $_POST['cr'];
	$strCode = $_POST['code'];
	//-- check if only want to get active calls
	if(!isset($_POST['ba']))
		$boolActive=false;
	$boolActive = $_POST['ba'];

	//cr, code, act

	$strCallrefList = "";
	if($intCallrefM!="")
	{
		$strTable = "CMN_REL_OPENCALL_OC";
		if($boolActive)
			$strTable = "CMN_REL_OPENCALL_OC, OPENCALL";

		$strSQL = "select FK_CALLREF_S from ".$strTable." where FK_CALLREF_M in (".$intCallrefM.") ";

		if($strCode != "") 
			$strSQL = $strSQL . " and RELCODE = '". $strCode ."'";
		if($boolActive)	
			$strSQL = $strSQL . " and FK_CALLREF_S = OPENCALL.CALLREF and OPENCALL.STATUS < 15";

		$oRS = get_recordset($strSQL,"swdata");
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
			if ($strCallrefList!="")$strCallrefList .=",";
			$strCallrefList .= PrepareForSql(get_field($oRS,"FK_CALLREF_S"));
		}
	}
	$where = "";
	if($strCallrefList=="")
		$strCallrefList = "-1";
	$where = "where callref in (".$strCallrefList.") ";

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>