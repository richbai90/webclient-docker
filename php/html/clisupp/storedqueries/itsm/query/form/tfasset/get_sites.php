<?php
	$strEquipId = $_POST["eid"];
	if(!_validate_url_param($strEquipId,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT FK_SITE_NAME FROM ASSET_SITE WHERE FK_EQUIPID = '" . PrepareForSql($strEquipId)."'";
?>