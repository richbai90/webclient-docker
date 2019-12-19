<?php
	//-- 2012.11.07
	//-- return search results for a basic me search form (as used in forms search_company, search address)
	if(!isset($_POST['id']))
	{
		//echo generateCustomErrorString("-100","An invalid Supplier Value was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	
	$strSupplierId = $_POST["id"];

	if($strSupplierId=="")
	{
		//echo generateCustomErrorString("-100","An invalid Supplier Value was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}

	$strContracts = "";
	$strSelect = "select * from system_sla where tpcompany='".PrepareForSql($strSupplierId)."'";
	$oRS = get_recordset($strSelect,"syscache");
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
		if($strContracts!="")$strContracts .=",";
		$strContracts .=  get_field($oRS,"SLAID");
	}

	$strFilter = "";
	if($strContracts!="")
	{
		$strFilter = " and fk_priority in (".$strContracts.")";
	}

	$where = " where fk_company_id = '".PrepareForSql($strSupplierId)."' and type='supplier'".$strFilter; 

	//-- command
	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>