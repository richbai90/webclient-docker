<?php
	$strCompanyID = $_POST["orgid"];
	if(!_validate_url_param($strCompanyID,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = "SELECT FK_CHILD_ID FROM CONFIG_RELI WHERE FK_PARENT_TYPE='ME->COMPANY' AND FK_CHILD_TYPE='ME->SITE' AND FK_PARENT_ITEMTEXT = '" . PrepareForSql($strCompanyID) ."'";
?>