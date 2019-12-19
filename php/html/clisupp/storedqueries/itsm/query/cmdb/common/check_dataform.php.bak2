<?php
	//--TK Check CI has an extended details table record if not create one.
	$ciid = $_POST['id'];
	//--TK Check ID Is being passed
	if(!isset($_POST['id']))
	{
		//-- Silent Exit
		throwSuccess();
	}
	//-- Get Extended Details Table Record from Config_typei
	$strSelect = "select config_typei.extended_table, config_itemi.pk_auto_id from config_itemi, config_typei where ck_config_type = pk_config_type and pk_auto_id = '".PrepareForSql($ciid)."'";
	$oRS = get_recordset($strSelect,"swdata");
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
	//-- Get Table from Record
	while($oRS->Fetch())
	{ 
		$strTable =  get_field($oRS,"extended_table");
	}
	//-- Check Extended Details Record Exists
	if(!get_record($strTable, PrepareForSql($ciid)))
	{
		//-- If Not Create One
		$strPriKeyCol = getTablePrimaryKeyName($strTable);
		IncludeApplicationPhpFile("itsm.helpers.php");
		$arrData[$strPriKeyCol] = PrepareForSql($ciid);
		$arc = xmlmc_addRecord($strTable,$arrData);
		if(1==$arc)
		{
			throwSuccess();
		}
		else
		{
			throwError(100,$arc);
		}
	}
	throwSuccess(1);
	exit;
?>