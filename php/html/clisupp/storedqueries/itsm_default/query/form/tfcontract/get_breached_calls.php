<?php
	$strContract = $_POST["contract"];
	if(!_validate_url_param($strContract,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	//-- command
	$sqlDatabase = "sw_systemdb";
	$sqlCommand = "SELECT * FROM opencall_sla WHERE name = '" . PrepareForSql($strContract)."' and fix_ctr<0";
?>