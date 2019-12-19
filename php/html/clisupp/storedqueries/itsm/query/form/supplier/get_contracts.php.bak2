<?php
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

	$strContractIDs = "";
	$strSQL = "Select * from CONFIG_RELI where FK_PARENT_ITEMTEXT = '".PrepareForSql($strSupplierId)."' and FK_PARENT_TYPE = 'ME->SUPPLIER' and FK_CHILD_TYPE='ME->CONTRACT'";
	$oRS = get_recordset($strSQL,"swdata");
	//-- Include App Specific Helpers File
    IncludeApplicationPhpFile("app.helpers.php");
	//-- Check for XMLMC Error
	if($oRS->result==false)
	{
		//-- Function from app.helpers.php to process error message.
		handle_app_error($oRS->lastErrorResponse);
		exit(0);
	}
	//-- END
	while($oRS->Fetch())
	{ 
		if($strContractIDs!="")$strContractIDs .=",";
		$strContractIDs .=  get_field($oRS,"FK_CHILD_ID");
	}
	if($strContractIDs=="")$strContractIDs="-1";
	
	$sqlDatabase = "swdata";
	$sqlCommand = "select PK_CONTRACT_ID, FLG_VALID, FLG_ALWAYSSUPPORT,FK_CHILD_ID, FK_CHILD_ITEMTEXT, FK_MANAGER, FK_PRIORITY from CONTRACT, CONFIG_RELI where FK_PARENT_ID = fk_cmdb_id and FK_PARENT_ID IN (" . $strContractIDs . ") and FK_CHILD_ID in (" .  $strKeys . ")";
?>