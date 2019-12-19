<?php
	//-- create filter to get table records where - expects table and filter
	$fromTable = PrepareForSql($_POST['table']);
	$filter = $_POST['filter'];
	
	$sqlDatabase = swfc_source();
	$sqlCommand  = "select * from " . $fromTable . " where " . $filter;
?>