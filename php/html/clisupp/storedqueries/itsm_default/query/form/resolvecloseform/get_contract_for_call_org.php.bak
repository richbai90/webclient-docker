<?php
	$strCallRef = $_POST['callref'];
	if(!_validate_url_param($strCallRef,"num"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}
// SWAP TO USE CONFIG_RELI
	$sqlDatabase = "swdata";
	$sqlCommand = "Select pk_contract_id, title, flg_support_unlimited, fk_cmdb_id, support_units_avail from contract where fk_company_id=(";
	$sqlCommand .= "Select fk_company_id from opencall where callref = ".PrepareForSql($strCallRef).")";
?>