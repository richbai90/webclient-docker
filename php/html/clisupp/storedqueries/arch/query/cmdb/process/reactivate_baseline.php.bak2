<?php
	$intCIkey = $_POST['intCIkey'];
	$intOldCIkey = $_POST['intOldCIkey'];

	//-- given ci and old ci key will reactiveate the old ci
	$strSelect = "select ck_config_type from CONFIG_ITEMI where pk_auto_id = " . $intCIkey;
	$oRS = get_recordset($strSelect);

	$strConfigType = "";
	if($oRS->Fetch()) 
	{
		$strConfigType = get_field($oRS,'ck_config_type');
	}
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("cmdb.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$boolOK = false;
	if($strConfigType=='ME->Service')
	{
		$service = new serviceFunctions();
		$boolOK = $service->can_manage_baselines();
	}else 
	{
		$cmdb = new cmdbFunctions();
		$boolOK = $cmdb->can_baseline();
		$cmdb->can_delete(true); //-- true param means will exit if current aid does not have right
	}
	if($boolOK) 
	{
		//-- process reactivate
		if($cmdb->reactivate_baseline($intCIkey, $intOldCIkey))
		{
			throwSuccess();
		}
		else
		{
			throwSuccess(-2); //-- for submitsqs global.js function - will take the -2 as indicator to return false and not show message 
		}
	}else 
	{
		throwSuccess(-2); //-- for submitsqs global.js function - will take the -2 as indicator to return false and not show message 
	}

?>