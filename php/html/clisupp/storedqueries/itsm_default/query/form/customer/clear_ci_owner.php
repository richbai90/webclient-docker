<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	$strKeys = $_POST["keys"];
	if(!_validate_url_param($strKeys,"csnum"))
	{
		throwProcessErrorWithMsg("An invalid value was specified. Please contact your Administrator.");
		exit(0);
	}

	$strKeys = prepareNumericCommaDelimitedValues($strKeys);
	$arrKeys = explode(',',$strKeys);
	
	foreach ($arrKeys as $key)
	{
		$strTable = "CONFIG_ITEMI";
		$arrData['PK_AUTO_ID'] = $key;
		$arrData['FK_USERDB'] = '';
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(1==$arc)
		{
			//-- record updated successfully
		}
		else
		{
			throwError(100,$arc);
		}
	}
	throwSuccess();
?>