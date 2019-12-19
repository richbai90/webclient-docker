<?php
	IncludeApplicationPhpFile("itsm.helpers.php");
	if(!isset($_POST['id']) || $_POST['id']=="")
	{
		throwProcessErrorWithMsg("An invalid Supplier Value was specified. Please contact your Administrator.");
		exit(0);
	}
	
	$strSupplierId = $_POST["id"];
	if(!_validate_url_param($strSupplierId,"sqlparamstrict"))
	{
		throwProcessErrorWithMsg("An invalid Supplier Value was specified. Please contact your Administrator.");
		exit(0);
	}

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
		$arrData['FK_SUPPLIER'] = PrepareForSql($strSupplierId);
		$arc = xmlmc_updateRecord($strTable,$arrData);
		if(1==$arc)
		{
			//-- supplier updated successfully
		}
		else
		{
			throwError(100,$arc);
		}
	}
	throwSuccess();
?>