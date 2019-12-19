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
	$strCode = $_POST['code'];

	$strActive ="";
	if(isset($_POST['ba']) && $_POST['ba']=="1")
		$boolActive = " and isactivebaseline = 'Yes'";

	$strCIlist = "";
	if($intCallref!="")
	{
		$strSQL = "select FK_CI_AUTO_ID from CMN_REL_OPENCALL_CI where FK_CALLREF in (". $intCallref .") ";
		if($strCode != "") 
			$strSQL = $strSQL ." and RELCODE = '". $strCode ."'";
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
			if ($strCIlist!="")$strCIlist .=",";
			$strCIlist .= PrepareForSql(get_field($oRS,"FK_CI_AUTO_ID"));
		}
	}
	if($strCIlist=="")
	{
		//-- SQL Optimisation Dont Query if StrID's = 0
		$strCIlist="0";
		throwSuccess();
	}
	
	$where = "where pk_auto_id in (".$strCIlist.") ";
	//--
	$inType = $_POST["type"];

	$strAdditServiceFilter = "(CK_CONFIG_TYPE LIKE 'ME->SERVICE' OR CK_CONFIG_TYPE LIKE 'Service%' ".$boolActive.")";
	$strAdditItemFilter = "(CK_CONFIG_TYPE NOT LIKE 'ME->%' AND CK_CONFIG_TYPE NOT LIKE 'Service%' ".$boolActive.")";

	//TYPE1 = CIs
	//TYPE2 = Services
	//TYPE3 = CIs and Services
	$strExtraWhere = "";
	if($inType==1)
		$where .= "and (".$strAdditItemFilter.")";
	elseif($inType==2)
		$where .= "and (".$strAdditServiceFilter.")";
	elseif($inType==3)
		$where .= "and (".$strAdditServiceFilter." OR ".$strAdditItemFilter.")";

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . " from config_itemi " . $where . swfc_orderby();
?>