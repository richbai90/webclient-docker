<?php
	//-- create filter to get table record count - used by global.GetCacheRecordCount
	$fromTable = PrepareForSql($_POST['table']);
	$sqlDatabase = swfc_source();
	$sqlCommand  = "select count(*) as counter from " . $fromTable . " where " . $filter;
?>