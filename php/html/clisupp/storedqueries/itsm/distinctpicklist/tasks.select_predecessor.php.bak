<?php
	//-- 2012.11.12
	//-- return data from sla table, filtered to current filter settings

	$parsedFilter = createPicklistFilterFromParams(swfc_tablename());

	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where (pk_auto_id <> ".$_POST['_id'].") and " . $parsedFilter;

	$sqlDatabase = "swdata";
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable().$parsedFilter. swfc_orderby();
?>