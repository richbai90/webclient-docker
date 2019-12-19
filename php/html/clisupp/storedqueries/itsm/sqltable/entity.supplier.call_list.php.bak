<?php
	if(!isset($_POST['id']))
	{
		//echo generateCustomErrorString("-100","An invalid Supplier Value was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	
	$strSupplierId = $_POST["id"];

	if(!_validate_url_param($strSupplierId,"sqlparamstrict"))
	{
		echo generateCustomErrorString("-100","An invalid Supplier Value specified. Please contact your Administrator.");
		exit(0);
	}
	if($strSupplierId=="")
	{
		//echo generateCustomErrorString("-100","An invalid Supplier Value was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	
	$where = " where owner='".PrepareForSql($strSupplierId)."'";

	//-- command
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>