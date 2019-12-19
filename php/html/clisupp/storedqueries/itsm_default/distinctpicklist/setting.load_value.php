<?php
	//-- 2012.11.12
	//-- return data from sla table, filtered to current filter settings

	$rec = get_record("sw_adm_settings", $_POST['setting']);

	$sqlDatabase = "swdata";
	$strDisplay = "";
	$strWhere = "";
	if($rec->display_field!="")
		$strDisplay = PrepareForSql($rec->display_field).",";
	if($rec->list_filter!="")
		$strWhere = " where ".$rec->list_filter;
	$sqlCommand = "select  ".PrepareForSql($rec->key_value)." from ".PrepareForSql($rec->source_table).strWhere;
?>