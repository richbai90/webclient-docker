<?php
	$fixTime = $_POST["ft"];
	if(!_validate_url_param($fixTime,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid contract was specified. Please contact your Administrator.");
		exit(0);
	}

	$respTime = $_POST["rt"];
	if(!_validate_url_param($respTime,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid contract was specified. Please contact your Administrator.");
		exit(0);
	}
	$timeZone = $_POST["tz"];
	if(!_validate_url_param($timeZone,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid contract was specified. Please contact your Administrator.");
		exit(0);
	}
	$slaId = $_POST["id"];
	if(!_validate_url_param($slaId,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid contract was specified. Please contact your Administrator.");
		exit(0);
	}

	$strUpdate = "update system_sla set timezone = '".PrepareForSql($timeZone)."',respTime = ".PrepareForSql($respTime).", fixTime=".PrepareForSql($fixTime)." where slaid = ".PrepareForSql($slaId);

	$arc = SqlExecute('sw_systemdb',$strUpdate);
	if(0==$arc)
	{
		throwProcessErrorWithMsg($arc."Failed to update sla details. Please contact your Administrator.");
		exit(0);
	}

	throwSuccess();
?>