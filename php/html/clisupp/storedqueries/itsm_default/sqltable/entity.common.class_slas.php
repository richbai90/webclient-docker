<?php
	if(!isset($_POST['reltype']) ||$_POST['reltype']=="" || !isset($_POST['fk_rel_id']) || $_POST['fk_rel_id'] == "")
	{
		//echo generateCustomErrorString("-100","An invalid customer id was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	
	$strReltype = $_POST["reltype"];
	$strRelId = $_POST["fk_rel_id"];
	
	$where = " where reltype = '".PrepareForSql($strReltype)."' AND fk_rel_id = '".PrepareForSql($strRelId)."'";
	$where .= " and appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
	
	//-- command
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>