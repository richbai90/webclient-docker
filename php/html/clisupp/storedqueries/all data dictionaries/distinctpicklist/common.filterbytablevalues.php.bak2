<?php
	//-- 2012.11.07
	//-- return data from swdata.swlist with passed in list id to be used within filter filter

	$parsedFilter = createPicklistFilterFromParams(swfc_tablename(),swfc_source());

	//-- if we have a filter then and the where
	if($parsedFilter!="") $parsedFilter = " where " . $parsedFilter;

	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable() .$parsedFilter. swfc_orderby();
?>