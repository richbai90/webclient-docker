<?php
	//-- create filter to get table record - expects 1 or 2 columns

	if(trim($_POST['keyvalue'])=="" || trim($_POST['table'])=="" || trim($_POST['keycol'])=="")
	{
		echo generateCustomErrorString("-302","Missing parameter detected in data/deleteRecord stored query. Please contact your Administrator");
		exit(0);
	}



	$fromTable = PrepareForSql($_POST['table']);
	$keyCol = PrepareForSql($_POST['keycol']);
	$keyColValue = PrepareForSql($_POST['keyvalue']);

	$isNumeric = (swdti_getdatatype($fromTable.".".$keyCol)==18)?true:false;
	if(!$isNumeric) $keyColValue = "'".$keyColValue."'";
	$filter = $keycol . ' = '. $keyColValue;

	$sqlDatabase = swfc_source();
	$sqlCommand  = "delete * from " . $fromTable . " where " . $filter;
?>