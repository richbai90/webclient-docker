<?php
	//-- 2012.11.12
	//-- return data from sla table, filtered to current filter settings

	$parsedFilter = createPicklistFilterFromParams(swfc_tablename());

	//-- if we have a filter then and the where
	if($parsedFilter!="") 
		$parsedFilter = " where id!='_SYSTEM' AND " . $parsedFilter;
	else
		$parsedFilter = " where id!='_SYSTEM'";

	$sqlDatabase = "sw_systemdb";
	$sqlCommand = swfc_selectcolumns() . " from swgroups ".$parsedFilter. swfc_orderby();
	error_log("sqlCommand : ".$sqlCommand);
?>