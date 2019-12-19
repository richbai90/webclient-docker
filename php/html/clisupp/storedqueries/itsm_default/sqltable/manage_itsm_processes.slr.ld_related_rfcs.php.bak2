<?php
	$intId = $_POST['id'];
	$strCode = $_POST['code'];
	
	if($intId!="")
	{
		$strTable = "CMN_REL_OPENCALL_CI";
		$strSQL = "select FK_CALLREF from ".$strTable." where FK_CI_AUTO_ID in (".$intId.") ";

		if($strCode != "") 
			$strSQL = $strSQL . " and RELCODE = '". $strCode ."'";

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
			if ($strRfcList!="")$strRfcList .=",";
			$strRfcList .= PrepareForSql(get_field($oRS,"FK_CALLREF"));
		}
	}
	
	$where = "";
	if($strRfcList=="")
		$strRfcList = "-1";
	$where = "where CALLREF in (".$strRfcList.") ";

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>