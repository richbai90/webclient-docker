<?php
	if(!isset($_POST['id']) || $_POST['id']=="")
	{
		//echo generateCustomErrorString("-100","An invalid Supplier Value was specified. Please contact your Administrator.");
		//exit(0);
		//--F0108357
		throwSuccess();
	}
	
	$strSupplierId = $_POST["id"];
	if(!_validate_url_param($strSupplierId,"sqlparamstrict"))
	{
		//echo generateCustomErrorString("-100","An invalid Supplier Value specified. Please contact your Administrator.");
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
		$strContracts .=  "'".PrepareForSql(get_field($oRS,"SLAID"))."'";
	}

	$strCallrefs = "-1";
	if($strContracts!="")
	{
		$strSelect = "select * from opencall_sla where name in (".$strContracts.") and fix_ctr<0";
		$oRS = get_recordset($strSelect,"syscache");
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
			$strCallrefs .=",";
			$strCallrefs .=  get_field($oRS,"callref");
		}
	}
	
	$where = " where callref in (".$strCallrefs.")";

	//-- command
	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() . $where . swfc_orderby();
?>