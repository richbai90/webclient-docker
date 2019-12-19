<?php
	$strAnalyst = $_POST["aid"];
	if(!_validate_url_param($strAnalyst,"sqlparamstrict") || $strAnalyst=="")
	{
		throwProcessErrorWithMsg("Invalid Analyst ID specified. Please contact your Administrator.");
		exit(0);
	}

	$rid = $_POST["rid"];
	if(!_validate_url_param($rid,"num") || $rid=="")
	{
		throwProcessErrorWithMsg("Invalid cfh ra id was specified. Please contact your Administrator.");
		exit(0);
	}

	$strUpdate ="update cfh_ra set update_analyst = '".PrepareForSql($strAnalyst)."',updatetimex=".time()." where pk_auto_id in (".$rid.")";		

	$arc = SqlExecute('swdata',$strUpdate);
	if(0==$arc)
	{
		throwProcessErrorWithMsg("Failed to insert cfh record for customer. Please contact your Administrator.");
		exit(0);
	}
	throwSuccess();
?>