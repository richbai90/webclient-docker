<?php
	if(!isset($_POST['callclass']) ||$_POST['callclass']=="" )
	{
		//echo generateCustomErrorString("-100","An invalid customer id was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	
	$strCallClass = $_POST["callclass"];
	
	$where = " where callclass = '".PrepareForSql($strCallClass)."' ";
	$where .= " and appcode in (".$_core['_sessioninfo']->datasetFilterList.")";
	
	//-- command
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>