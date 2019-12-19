<?php
	$strKeys = $_POST["keys"];
	if(!_validate_url_param($strKeys,"csnum") || $strKeys=="")
	{
		throwProcessErrorWithMsg("Invalid cfh role keys were specified. Please contact your Administrator.");
		exit(0);
	}

	$rid = $_POST["rid"];
	if(!_validate_url_param($rid,"num") || $rid=="")
	{
		throwProcessErrorWithMsg("Invalid cfh ra id was specified. Please contact your Administrator.");
		exit(0);
	}

	$strUpdate = "update cfh_ra_role set fk_cfh_ra_id = ".$rid." where pk_auto_id in (".$strKeys.")";


	$arc = SqlExecute('swdata',$strUpdate);
	if(0==$arc)
	{
		throwProcessErrorWithMsg("Failed to insert cfh record for customer. Please contact your Administrator.");
		exit(0);
	}
	throwSuccess();
?>