<?php
	if(!isset($_POST['id']) || $_POST['id']=="")
	{
		throwProcessErrorWithMsg("An invalid Supplier Value was specified. Please contact your Administrator.");
		exit(0);
	}
	
	$strSupplierId = $_POST["id"];
	if(!_validate_url_param($strSupplierId,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid Supplier ID was specified. Please contact your Administrator.");
		exit(0);
	}

	$strName = $_POST["nm"];
	if(!_validate_url_param($strName,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid Supplier Name was specified. Please contact your Administrator.");
		exit(0);
	}
	$strUpdate = "update swanalysts set name = '".PrepareForSql($strName)."' where analystid = '".PrepareForSql($strSupplierId)."'";
	$arc = SqlExecute('syscache',$strUpdate);
	if(0==$arc)
	{
		throwProcessErrorWithMsg($arc." Failed to set supplier name. Please contact your Administrator.");
		exit(0);
	}

	throwSuccess();
?>