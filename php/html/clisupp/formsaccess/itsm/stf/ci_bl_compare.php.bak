<?php
	$strSelect = "select ck_config_type from CONFIG_ITEMI where pk_auto_id = " . $_POST['ck_config_item'];
	$oRS = get_recordset($strSelect);
	$strConfigType = "";
	if($oRS->Fetch()) {
		$strConfigType = get_field($oRS,'ck_config_type');
	}
	$accessGranted = 1;
	if($strConfigType=='ME->Service'){
		IncludeApplicationPhpFile("service.helpers.php");
		$service = new serviceFunctions();
		$accessGranted = $service->can_manage_baselines();
	} else {
		IncludeApplicationPhpFile("cmdb.helpers.php");
		$cmdb = new cmdbFunctions();
		$accessGranted = $cmdb->can_baseline();
	}
?>