<?php
	if(!isset($_POST['fk_company_id']) ||$_POST['fk_company_id']=="")
	{
		//echo generateCustomErrorString("-100","An invalid company id was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	
	$strCompany = $_POST["fk_company_id"];
	$where = " where fk_company_id = '".PrepareForSql($strCompany)."'";

	//-- command
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>