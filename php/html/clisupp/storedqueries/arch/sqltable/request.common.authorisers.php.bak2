<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)
	
	//--TK SQL Optimisation
	if($_POST['empty'] == 1)
	{
		throwSuccess();
	}
	$intParentCallref = $_POST["cr"];
	if(!_validate_url_param($intParentCallref,"num"))
	{
		echo generateCustomErrorString("-100","An invalid callref was specified. Please contact your Administrator.");
		exit(0);
	}
	$intStageId = $_POST["sid"];
	if(!_validate_url_param($intStageId,"num"))
	{
		echo generateCustomErrorString("-100","An invalid stage was specified. Please contact your Administrator.");
		exit(0);
	}
	$where = " where fk_stage_id=".$intStageId." and fk_callref=".$intParentCallref;

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . " from bpm_oc_auth " . $where . swfc_orderby();


?>