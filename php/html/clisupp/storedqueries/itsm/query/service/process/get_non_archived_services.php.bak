<?php
	if(!isset($_POST['cids']) ||$_POST['cids']=="")
	{
		//echo generateCustomErrorString("-100","An invalid service list was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	
	$strIds = $_POST["cids"];

	if(!_validate_url_param($strIds,"csnum"))
	{
		//echo generateCustomErrorString("-100","An invalid service list specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}

	$sqlDatabase = "swdata";
	$sqlCommand = "select PK_AUTO_ID FROM CONFIG_ITEMI where pk_auto_id in (".PrepareForSql($strIds).") and (service_archived IS NULL OR service_archived != 1)";

	?>