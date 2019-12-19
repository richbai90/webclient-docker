<?php
	$strKeys = $_POST["rakey"];
	if(!_validate_url_param($strKeys,"csnum"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = "select * from cfh_ra_role where fk_cfh_ra_id = (".$strKeys. ")";
?>