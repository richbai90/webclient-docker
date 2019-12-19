<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strKeys = $_POST["keys"];
	if(!_validate_url_param($strKeys,"csnum"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$strTable = "CONFIG_ITEMI";
	$arrKeys = explode(",",$strKeys);
	
	foreach($arrKeys as $key)
	{
		$arrData['PK_AUTO_ID'] = $key;
		$arrData['FK_SUPPLIER'] = '';
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(1==$arc)
		{
			//-- supplier cleared successfully
		}
		else
		{
			throwError(100,$arc);
		}
	}
	throwSuccess();
?>