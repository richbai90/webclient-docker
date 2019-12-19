<?php
	//-- 2012.11.12
	//-- return data from sla table, filtered to current filter settings

	$parsedFilter = createPicklistFilterFromParams('userdb');

	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;

	$sqlDatabase = "swdata";
	$sqlCommand = "select count(*) as cnt from userdb ".$parsedFilter. swfc_orderby();
?>