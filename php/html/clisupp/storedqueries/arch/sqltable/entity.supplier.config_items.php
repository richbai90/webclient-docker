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
		//echo generateCustomErrorString("-100","An invalid Supplier Value specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	if($strSupplierId=="")
	{
		//echo generateCustomErrorString("-100","An invalid Supplier Value was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}

	$where = " where ck_config_type not like 'ME->%' and isactivebaseline='Yes' and fk_supplier='".PrepareForSql($strSupplierId)."'";

	//-- command
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>