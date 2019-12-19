<?php

	//-- will load sql table control using pk_auto_id in () and supprots optional passed in filter
	if($_POST['empty']=="1") {
		//-- return empty recordset
		throwSuccess(0);
	}

	IncludeApplicationPhpFile("service.helpers.php");
	$service = new serviceFunctions();

	if($service->can_manage_cost_and_subs()) {

		checkMandatoryParams("pids"); //-- will exit if mandatory param not found

		$sqlDatabase = swfc_source();
		$sqlCommand = swfc_selectcolumns() . swfc_fromtable(). " where PK_AUTO_ID in (" . pfs($_POST['pids']) . ")";

		//-- do we have a static filter to apply
		if($_POST["sf"]!="") {
			IncludeApplicationPhpFile("static.sql.php");
			$sqlCommand .= " and " . getStaticSql($_POST["sf"]);
		}

		$sqlCommand .= swfc_orderby();
	} else {
		throwError(-200,"You are not authorised to manage Service costs and subscriptions.\nIf you require authorisation please contact your Supportworks Administrator."); //-- fail and exit	
	}

?>