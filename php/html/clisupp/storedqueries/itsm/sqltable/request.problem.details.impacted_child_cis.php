<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)
	if(!isset($_POST['cis']))
		$inCIIDs = "-1";
	else
		$inCIIDs = $_POST["cis"];

	$strCIKeys = $_POST['cis'];
	if(!_validate_url_param($strCIKeys,"csnum"))
	{
		echo generateCustomErrorString("-100","Non integer values passed as key. Please contact your Administrator.");
		exit(0);
	}

	$strSQL =  "select FK_CHILD_ID from config_reli where (fk_child_type not like 'ME->%' OR fk_child_type like 'ME->SERVICE') and fk_parent_id in (".$strCIKeys.")";

	$strChildKeys = "";

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
		if($strChildKeys!="")$strChildKeys.=",";
		$strChildKeys.=get_field($oRS,'FK_CHILD_ID');
	}

	if($strChildKeys=="")
		$strChildKeys = "-1";

	$where = " where pk_auto_id in (".$strChildKeys.")";
	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . " from config_itemi " . $where . swfc_orderby();
?>