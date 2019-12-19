<?php

	//-- select a passed in table record using passed in primary key value
	$boolUseAppCode = isset($_POST["_ac"]);

	$sqlDatabase = "swdata";
	if($_POST['cdb']=="1")	$sqlDatabase = "sw_systemdb";

	$strTableName = swfc_tablename();

	$strKeyCol = $_POST['okc'];

	if($strKeyCol=="")
	{
		//-- use primary
		$strKeyCol = getTablePrimaryKeyName($strTableName,$sqlDatabase);

	}
	$acFilter = "";
	if($boolUseAppCode)
	{
			$colName = "appcode";
			$colValue = "'" . PrepareForSql($session->currentDataDictionary) . "'";

			//-- oracle mods
			if($session->oracleInUse)
			{
				$colName = " UPPER(" . $colName . ") ";
				$colValue = " UPPER(" . $colValue . ") ";
			}
			$acFilter = " AND ".$colName . " = ". $colValue;
	}

	//--
	$selectCols = "*";
	if(isset($_POST['_select_']))
	{
		$selectCols = pfs($_POST['_select_']);
	}

	$sqlCommand =  "select ".UC($selectCols)." from " . UC($strTableName) . " where ".UC($strKeyCol) ." in (" . encapsulate($strTableName,$strKeyCol ,$_POST['kv'],$sqlDatabase) .") ". $acFilter;

?>