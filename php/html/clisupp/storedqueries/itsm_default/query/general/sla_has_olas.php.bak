<?php

	//-- global sla_has_olas

	$strTable = "CONFIG_RELI";
	$strWhere = "";
	$strAppcodes = $_POST['acs'];
	//echo $strAppcodes;
	if($strAppcodes!="")
	{
		$strTable = "CONFIG_RELI,ITSMSP_SLAD_OLA";
		$strWhere = " FK_CHILD_ID=FK_CMDB_ID AND APPCODE IN (". prepareStringCommaDelimitedValues($strAppcodes).") AND ";
	}

	$strSQL  = "SELECT FK_CHILD_ITEMTEXT FROM ".$strTable." WHERE ".$strWhere." FK_PARENT_ITEMTEXT = '" . pfs($_POST['slaid']) . "' AND FK_PARENT_TYPE='ME->SLA' AND FK_CHILD_TYPE='ME->OLA'";
	$oRS = get_recordset($strSQL);
	//-- Include App Specific Helpers File
    IncludeApplicationPhpFile("app.helpers.php");
	//-- Check for XMLMC Error
	if($oRS->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRS->lastErrorResponse);
		exit(0);
	}
	//echo $strSQL;
	
	//-- END
	if($oRS->Fetch())
	{
		throwSuccess(); //-- so client function that called submitsqp gets true
	}
	throwProcessSilentError();//-- so client function that called submitsqp gets false - with no messages


?>