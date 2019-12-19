<?php
	if(!isset($_POST['rid']) ||$_POST['rid']=="")
	{
		//echo generateCustomErrorString("-100","An invalid role id was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	
	$strRoleId = $_POST["rid"];
	if(!_validate_url_param($strRoleId,"sqlparamstrict"))
	{
		//echo generateCustomErrorString("-100","An invalid role id was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}

	$where = " where fk_cfh_ra_id = '".PrepareForSql($strCompany)."'";

	//-- command
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>