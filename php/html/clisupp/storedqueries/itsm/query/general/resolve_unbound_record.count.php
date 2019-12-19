<?php

	//-- fglobal.prototype.resolve_unbound_record - get record count
	$strTable = swfc_tablename();
	$strWhere = $_POST['rc'] . " = " . encapsulate($strTable,$_POST['rc'],$_POST['rv']);

	$sqlDatabase = "swdata";
	$sqlCommand = "select count(*) as counter from " . $strTable  ." where ". $strWhere;
?>