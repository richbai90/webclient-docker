<?php
	$strCompany = $_POST["company"];
	if(!_validate_url_param($strCompany,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$where = "";
	if(isset( $_POST["contract"]))
	{
		$strContract = $_POST["contract"];
		if(!_validate_url_param($strContract,"sqlparamstrict"))
		{
			throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
			exit(0);
		}
		$where =  " OR pk_contract_id = '".PrepareForSql($strContract)."'";
	}

	$sqlDatabase = "swdata";
	$sqlCommand = "Select pk_contract_id, title, flg_support_unlimited, fk_cmdb_id from contract where fk_company_id='".PrepareForSql($strCompany)."'".$where;
?>