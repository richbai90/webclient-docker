<?php

	//-- global.js filter_company_contracts sets a filter for passed in oList

	if(!isset($_POST['pcid']) || $_POST['pcid']=="")
	{
		//--return 0 records
		throwSuccess(0);
		exit;
	}

	$contractIds = "";
	$arrContractIds=explode(",",$_POST['pcid']);
	while (list($pos,$contractID) = each($arrContractIds))
	{
		if($contractIds != "")	$contractIds .= ",";
		$contractIds .= "'".pfs($contractID)."'";
	}

	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . " where PK_CONTRACT_ID in (".$contractIds.")" . swfc_orderby();

?>