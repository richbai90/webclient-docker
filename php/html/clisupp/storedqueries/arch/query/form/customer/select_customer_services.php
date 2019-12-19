<?php
	$strKeysearch = $_POST["ks"];
	if(!_validate_url_param($strKeysearch,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = "select * from config_relme where ci_type like 'Service%' and fk_me_key = '".PrepareForSql($strKeysearch)."' and code = 'CUSTOMER' and ci_active = 'Yes'";	
?>