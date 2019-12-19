<?php
	if(!isset($_POST['kv']) ||$_POST['kv']=="")
	{
		//echo generateCustomErrorString("-100","An invalid service list was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	
	$strIds = $_POST["kv"];

	if(!_validate_url_param($strIds,"csnum"))
	{
		//echo generateCustomErrorString("-100","An invalid service list specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}

	$where = " where pk_auto_id in (".PrepareForSql($strIds).") and isactivebaseline='Yes'";

	//-- command
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>