<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)
	$intCallref = $_POST['cr'];
	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}
	if(!_validate_url_param($intCallref,"num"))
	{
		echo generateCustomErrorString("-100","Invalid callref provided. Please contact your Administrator.");
		exit(0);
	}

	$strCode = $_POST['code'];

	$where = " where fk_callref=".$intCallref;

	if($strCode!="")
		$where .= " and relcode='".PrepareForSql($strCode)."'";
	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>