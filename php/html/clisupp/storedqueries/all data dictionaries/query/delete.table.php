<?php

	//-- delete table row by a keycol value

	$tableName = UC(swfc_tablename());
	$selectCol = UC(dd_primarykey($tableName));
	if($_POST['cs']=="1")
	{
		//-- comma seperated so enaps and pfs each
		$arrKeys = explode(",",$_POST['kv']);
		while (list($pos,$keyValue) = each($arrKeys))
		{
			if($colValues !="")$colValues .=",";
			$colValues .= encapsulate($tableName,$selectCol,$keyValue);
		}

		$strWhere = " WHERE " . $selectCol . " in (" . $colValues .")";
	}
	else
	{
		$colValue = encapsulate($tableName,$selectCol,$_POST['kv']);
		$strWhere = " WHERE " . $selectCol . " = " . $colValue;
	}

	$sqlDatabase = "swdata";
	if($_POST['cdb']=="1")	$sqlDatabase = "sw_systemdb";
    $sqlCommand = "DELETE FROM " . $tableName . $strWhere

?>