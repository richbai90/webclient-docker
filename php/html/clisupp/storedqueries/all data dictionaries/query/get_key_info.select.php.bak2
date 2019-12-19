<?php

	//-- global.js get_key_info
	$strTable = swfc_tablename();
	$strKeyCol = $_POST['kc'];
	if($strKeyCol=="")$strKeyCol = dd_primarykey($strTable);

	$varKeyValue = encapsulate($strTable, $strKeyCol,$_POST['kv']);

	$sqlDatabase = "swdata";
	$sqlCommand = "select " . pfs($_POST['ic']) . " as infotxt from " . $strTable . " where " . $strKeyCol . " = " . $varKeyValue;


?>