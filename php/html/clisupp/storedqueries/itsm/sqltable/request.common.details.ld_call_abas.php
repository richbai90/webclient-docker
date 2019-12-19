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

	$intCallref = $_POST['cr'];


	$strABAList = "";
	if($intCallref!="")
	{
		$strGetABAList = "select fk_bus_area_id from cmn_rel_opencall_aba where status = 'Active' and fk_callref = ".$intCallref;
		$oRS = get_recordset($strGetABAList);
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
			if ($strABAList!="")$strABAList .=",";
			$strABAList .= "'".PrepareForSql(get_field($oRS,"fk_bus_area_id"))."'";
		}
	}
	if ($strABAList == "")
		$strWhere = " where pk_area_id = ''";
	else
		$strWhere = " where pk_area_id IN (".$strABAList.")";

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . " from AFFECTED_BUS_AREA " . $strWhere . swfc_orderby();

?>