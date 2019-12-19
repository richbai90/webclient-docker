<?php
	if(!isset($_POST['ks']) ||$_POST['ks']=="")
	{
		//echo generateCustomErrorString("-100","An invalid customer id was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	
	if(!isset($_POST['pk']) ||$_POST['pk']=="")
	{
		//echo generateCustomErrorString("-100","An invalid cfh id was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}

	$strKeysearch = $_POST["ks"];
	$intCFHID = $_POST["pk"];
	if(!_validate_url_param($strKeysearch,"sqlparamstrict"))
	{
		echo generateCustomErrorString("-100","An invalid customer id was specified. Please contact your Administrator.");
		exit(0);
	}
	if(!_validate_url_param($intCFHID,"num"))
	{
		echo generateCustomErrorString("-100","An invalid cfh id was specified. Please contact your Administrator.");
		exit(0);
	}
	$where = " where fk_keysearch = '".PrepareForSql($strCompany)."' and pk_auto_id!=".$intCFHID;

	//-- command
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>