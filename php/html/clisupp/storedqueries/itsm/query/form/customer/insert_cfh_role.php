<?php
	$strRoleId = $_POST["rlid"];
	if(!_validate_url_param($strRoleId,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$strRole = $_POST["rl"];
	if(!_validate_url_param($strRole,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$strRAId = $_POST["rid"];
	if(!_validate_url_param($strRAId,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$strInsert = "insert into cfh_ra_role (role_id,role,fk_cfh_ra_id) values ('".PrepareForSql($strRoleId)."','".PrepareForSql($strRole)."',".PrepareForSql($strRAId).")";
	if(!SqlExecute('swdata',$strInsert))
	{
		throwProcessErrorWithMsg("Failed to associate role to ra record. Please contact your Administrator.");
		exit(0);
	}

	 throwSuccess();
?>