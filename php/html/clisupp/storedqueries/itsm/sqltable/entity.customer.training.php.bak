<?php
	if(!isset($_POST['ks']) ||$_POST['ks']=="")
	{
		//echo generateCustomErrorString("-100","An invalid customer id was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	
	$strKeysearch = $_POST["ks"];
	if(!_validate_url_param($strKeysearch,"sqlparamstrict"))
	{
		//echo generateCustomErrorString("-100","An invalid customer id was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}

	$where = " where fk_keysearch = '".PrepareForSql($strKeysearch)."'";

	//-- command
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>