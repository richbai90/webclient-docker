<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	
	$strFKs = $_POST['contracts'];
	if(!_validate_url_param($strFKs,"sqlparamstrict"))
	{
		echo generateCustomErrorString("-100","Parameter passed may be a security risk. Please contact your Administrator.");
		exit(0);
	}
	$strOrganisation = $_POST['parent'];
	if(!_validate_url_param($strOrganisation,"sqlparamstrict"))
	{
		echo generateCustomErrorString("-100","Parameter passed may be a security risk. Please contact your Administrator.");
		exit(0);
	}
	
	$arrSelectedKeys = explode(',',$strFKs);

	// -- Build an array of columns to set for updateRecord. More than one Contract can be selected
	foreach ($arrSelectedKeys as $key)
	{
		$strTable = "CONTRACT";
		$arrData['PK_CONTRACT_ID'] = PrepareForSql($key);
		$arrData['FK_COMPANY_ID'] = $strOrganisation;
		
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(1==$arc)
		{
			continue;
		}
		else
		{
			throwError(100,$arc);
		}
	}
	throwSuccess();	

?>